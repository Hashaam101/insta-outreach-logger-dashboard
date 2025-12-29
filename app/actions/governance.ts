'use server';

import { auth } from "@/auth";
import { dbQuery, dbQuerySingle } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { GoalMetric, GoalFrequency } from "@/types/db";
import { completeSync } from "./sync";
import { getCachedOperators, getCachedActors } from "@/lib/data";

export { getCachedOperators, getCachedActors };

/**
 * 1. Transfer Actor Ownership
 * Updates the OPR_ID for a specific ACT_ID record.
 */
export async function transferActor(actorId: string, newOperatorName: string) {
    const session = await auth();
    if (!session?.user?.operator_name) throw new Error("Unauthorized");

    try {
        // 1. Get New Operator ID
        const newOp = await dbQuerySingle<{ OPR_ID: string }>(
            `SELECT OPR_ID FROM OPERATORS WHERE OPR_NAME = :name`,
            { name: newOperatorName }
        );

        if (!newOp) throw new Error(`Operator ${newOperatorName} not found`);

        // 2. Update Actor Record
        await dbQuery(
            `UPDATE ACTORS SET OPR_ID = :new_id WHERE ACT_ID = :id`,
            { new_id: newOp.OPR_ID, id: actorId }
        );

        console.log(`AUDIT: Actor record ${actorId} transferred to ${newOperatorName} by ${session.user.operator_name}`);

        await completeSync();
        
        revalidatePath('/settings');
        revalidatePath('/actors');
        return { success: true };
    } catch (e: unknown) {
        const err = e as Error;
        return { success: false, error: err.message };
    }
}

/**
 * 1b. Share Actor Ownership
 * Inserts a NEW record in ACTORS table for an existing ACT_USERNAME.
 */
export async function shareActor(actorHandle: string, newOperatorName: string) {
    const session = await auth();
    if (!session?.user?.operator_name) throw new Error("Unauthorized");

    try {
        const newOp = await dbQuerySingle<{ OPR_ID: string }>(
            `SELECT OPR_ID FROM OPERATORS WHERE OPR_NAME = :name`,
            { name: newOperatorName }
        );

        if (!newOp) throw new Error(`Operator ${newOperatorName} not found`);

        // Check if already shared with this operator
        const existing = await dbQuerySingle(
            `SELECT ACT_ID FROM ACTORS WHERE ACT_USERNAME = :handle AND OPR_ID = :opr`,
            { handle: actorHandle, opr: newOp.OPR_ID }
        );

        if (existing) throw new Error("Actor is already assigned to this operator");

        const actId = `ACT-${Date.now().toString(16).slice(-8).toUpperCase()}`;

        await dbQuery(
            `INSERT INTO ACTORS (ACT_ID, ACT_USERNAME, OPR_ID, ACT_STATUS, CREATED_AT, LAST_ACTIVITY)
             VALUES (:id, :handle, :opr, 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            { id: actId, handle: actorHandle, opr: newOp.OPR_ID }
        );

        console.log(`AUDIT: Actor ${actorHandle} shared with ${newOperatorName} by ${session.user.operator_name}`);

        await completeSync();

        revalidatePath('/actors');
        return { success: true };
    } catch (e: unknown) {
        const err = e as Error;
        return { success: false, error: err.message };
    }
}

/**
 * 1c. Update Actor Status
 */
export async function updateActorStatus(actorId: string, newStatus: string) {
    const session = await auth();
    if (!session?.user?.operator_name) throw new Error("Unauthorized");

    try {
        const current = await dbQuerySingle<{ ACT_STATUS: string, ACT_USERNAME: string }>(
            `SELECT ACT_STATUS, ACT_USERNAME FROM ACTORS WHERE ACT_ID = :id`,
            { id: actorId }
        );

        await dbQuery(
            `UPDATE ACTORS SET ACT_STATUS = :status WHERE ACT_ID = :id`,
            { status: newStatus, id: actorId }
        );

        const op = await dbQuerySingle<{ OPR_ID: string }>(
            `SELECT OPR_ID FROM OPERATORS WHERE OPR_NAME = :n`, 
            { n: session.user.operator_name }
        );

        if (op && current) {
            const elgId = `ELG-${Date.now().toString(16).slice(-6).toUpperCase()}${Math.floor(Math.random()*100)}`;
            await dbQuery(
                `INSERT INTO EVENT_LOGS (ELG_ID, EVENT_TYPE, ACT_ID, OPR_ID, DETAILS, CREATED_AT)
                 VALUES (:id, 'User', :act, :opr, :details, SYSTIMESTAMP)`,
                { 
                    id: elgId, 
                    act: actorId, 
                    opr: op.OPR_ID,
                    details: `Actor Change = [Status (@${current.ACT_USERNAME}): ${current.ACT_STATUS} -> ${newStatus}]`
                }
            );
        }

        await completeSync();

        revalidatePath('/actors');
        return { success: true };
    } catch (e: unknown) {
        const err = e as Error;
        return { success: false, error: err.message };
    }
}

/**
 * 2. Transfer Lead Ownership (Logical)
 * Since Targets are shared, this logs a 'Transfer' event to indicate handoff.
 */
export async function transferLead(targetUsername: string, newActorHandle: string) {
    const session = await auth();
    if (!session?.user?.operator_name) throw new Error("Unauthorized");

    try {
        // Resolve IDs
        const target = await dbQuerySingle<{ TAR_ID: string }>(`SELECT TAR_ID FROM TARGETS WHERE TAR_USERNAME = :t`, { t: targetUsername });
        const actor = await dbQuerySingle<{ ACT_ID: string, OPR_ID: string }>(`SELECT ACT_ID, OPR_ID FROM ACTORS WHERE ACT_USERNAME = :a`, { a: newActorHandle });
        
        if (!target || !actor) throw new Error("Target or New Actor not found");

        // Generate ID
        const elgId = `ELG-${Date.now().toString(16).slice(-10).toUpperCase()}`; // Simple mock ID gen

        // Log Event
        await dbQuery(
            `INSERT INTO EVENT_LOGS (ELG_ID, EVENT_TYPE, ACT_ID, OPR_ID, TAR_ID, DETAILS, CREATED_AT)
             VALUES (:id, 'Change in Tar Info', :act, :opr, :tar, :details, CURRENT_TIMESTAMP)`,
            {
                id: elgId,
                act: actor.ACT_ID,
                opr: actor.OPR_ID,
                tar: target.TAR_ID,
                details: `[Transfer] Ownership claimed by @${newActorHandle}`
            }
        );

        await completeSync();

        revalidatePath('/leads');
        return { success: true };
    } catch (e: unknown) {
        const err = e as Error;
        return { success: false, error: err.message };
    }
}

/**
 * 3. Suggest Team Goal
 * Inserts a GOAL with ASSIGNED_TO_OPR = NULL
 */
export async function suggestTeamGoal(metric: GoalMetric, value: number, frequency: GoalFrequency = 'Daily') {
    const session = await auth();
    if (!session?.user?.operator_name) throw new Error("Unauthorized");

    try {
        const op = await dbQuerySingle<{ OPR_ID: string }>(`SELECT OPR_ID FROM OPERATORS WHERE OPR_NAME = :n`, { n: session.user.operator_name });
        if (!op) throw new Error("Operator not found");

        const goalId = `GOL-${Date.now().toString(16).slice(-8).toUpperCase()}`;

        await dbQuery(`
            INSERT INTO GOALS (GOAL_ID, METRIC, TARGET_VALUE, FREQUENCY, ASSIGNED_TO_OPR, STATUS, SUGGESTED_BY, CREATED_AT, START_DATE)
            VALUES (:id, :metric, :val, :freq, NULL, 'Active', :by, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, {
            id: goalId,
            metric,
            val: value,
            freq: frequency,
            by: op.OPR_ID
        });

        revalidatePath('/analytics');
        revalidatePath('/');
        return { success: true };
    } catch (e: unknown) {
        const err = e as Error;
        return { success: false, error: err.message };
    }
}

/**
 * 4. Set Personal Goal
 * Inserts a GOAL with ASSIGNED_TO_OPR = <Me>
 */
export async function setPersonalGoal(metric: GoalMetric, value: number, frequency: GoalFrequency = 'Daily') {
    const session = await auth();
    if (!session?.user?.operator_name) throw new Error("Unauthorized");

    try {
        const op = await dbQuerySingle<{ OPR_ID: string }>(`SELECT OPR_ID FROM OPERATORS WHERE OPR_NAME = :n`, { n: session.user.operator_name });
        if (!op) throw new Error("Operator not found");

        // Deactivate old personal goals for this metric
        await dbQuery(`
            UPDATE GOALS SET STATUS = 'Archived' 
            WHERE ASSIGNED_TO_OPR = :op AND METRIC = :metric AND STATUS = 'Active'
        `, { op: op.OPR_ID, metric });

        const goalId = `GOL-${Date.now().toString(16).slice(-8).toUpperCase()}`;

        await dbQuery(`
            INSERT INTO GOALS (GOAL_ID, METRIC, TARGET_VALUE, FREQUENCY, ASSIGNED_TO_OPR, STATUS, SUGGESTED_BY, CREATED_AT, START_DATE)
            VALUES (:id, :metric, :val, :freq, :op, 'Active', :op, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, {
            id: goalId,
            metric,
            val: value,
            freq: frequency,
            op: op.OPR_ID
        });

        revalidatePath('/analytics');
        revalidatePath('/');
        return { success: true };
    } catch (e: unknown) {
        const err = e as Error;
        return { success: false, error: err.message };
    }
}

export interface GoalView {
    id: string;
    metric: string;
    targetValue: number;
    frequency: string;
    isTeam: boolean;
    assignedTo?: string; // OPR_NAME
}

/**
 * 5. Get Goals Dashboard Data
 */
export async function getGoalsDashboardData(): Promise<GoalView[]> {
    try {
        // Fetch Active Team Goals and Personal Goals
        const goals = await dbQuery<{
            GOAL_ID: string;
            METRIC: string;
            TARGET_VALUE: number;
            FREQUENCY: string;
            ASSIGNED_TO_OPR: string | null;
            OPR_NAME?: string;
        }>(`
            SELECT 
                g.GOAL_ID, 
                g.METRIC, 
                g.TARGET_VALUE, 
                g.FREQUENCY, 
                g.ASSIGNED_TO_OPR,
                o.OPR_NAME
            FROM GOALS g
            LEFT JOIN OPERATORS o ON g.ASSIGNED_TO_OPR = o.OPR_ID
            WHERE g.STATUS = 'Active'
            ORDER BY g.CREATED_AT DESC
        `);

        return goals.map((g) => ({
            id: g.GOAL_ID,
            metric: g.METRIC,
            targetValue: g.TARGET_VALUE,
            frequency: g.FREQUENCY,
            isTeam: !g.ASSIGNED_TO_OPR,
            assignedTo: g.OPR_NAME
        }));
    } catch (e) {
        console.error("Goals fetch failed:", e);
        return [];
    }
}

/**
 * 7. Propose Goal
 */
export async function proposeGoal(data: {
    metric: GoalMetric;
    value: number;
    frequency: GoalFrequency;
    assignedToOpr?: string | null;
    assignedToAct?: string | null;
}) {
    const session = await auth();
    if (!session?.user?.operator_name) throw new Error("Unauthorized");

    try {
        const op = await dbQuerySingle<{ OPR_ID: string }>(`SELECT OPR_ID FROM OPERATORS WHERE OPR_NAME = :n`, { n: session.user.operator_name });
        if (!op) throw new Error("Operator not found");

        const goalId = `GOL-${Date.now().toString(16).slice(-8).toUpperCase()}`;

        await dbQuery(`
            INSERT INTO GOALS (GOAL_ID, METRIC, TARGET_VALUE, FREQUENCY, STATUS, SUGGESTED_BY, ASSIGNED_TO_OPR, ASSIGNED_TO_ACT, CREATED_AT, START_DATE)
            VALUES (:id, :metric, :val, :freq, 'Pending Suggestion', :by, :opr, :act, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, {
            id: goalId,
            metric: data.metric,
            val: data.value,
            freq: data.frequency,
            by: op.OPR_ID,
            opr: data.assignedToOpr || null,
            act: data.assignedToAct || null
        });

        revalidatePath('/goals');
        return { success: true };
    } catch (e: unknown) {
        const err = e as Error;
        return { success: false, error: err.message };
    }
}

/**
 * 8. Propose Rule
 */
export async function proposeRule(data: {
    type: string;
    metric: string;
    limitValue: number;
    window: number;
    assignedToOpr?: string | null;
    assignedToAct?: string | null;
}) {
    const session = await auth();
    if (!session?.user?.operator_name) throw new Error("Unauthorized");

    try {
        const op = await dbQuerySingle<{ OPR_ID: string }>(`SELECT OPR_ID FROM OPERATORS WHERE OPR_NAME = :n`, { n: session.user.operator_name });
        if (!op) throw new Error("Operator not found");

        const ruleId = `RUL-${Date.now().toString(16).slice(-8).toUpperCase()}`;

        await dbQuery(`
            INSERT INTO RULES (RULE_ID, TYPE, METRIC, LIMIT_VALUE, TIME_WINDOW_SEC, STATUS, SUGGESTED_BY, ASSIGNED_TO_OPR, ASSIGNED_TO_ACT, CREATED_AT)
            VALUES (:id, :type, :metric, :val, :window, 'Pending Suggestion', :by, :opr, :act, CURRENT_TIMESTAMP)
        `, {
            id: ruleId,
            type: data.type,
            metric: data.metric,
            val: data.limitValue,
            window: data.window,
            by: op.OPR_ID,
            opr: data.assignedToOpr || null,
            act: data.assignedToAct || null
        });

        revalidatePath('/goals');
        return { success: true };
    } catch (e: unknown) {
        const err = e as Error;
        return { success: false, error: err.message };
    }
}

/**
 * 9. Delete Goal
 */
export async function deleteGoal(id: string) {
    const session = await auth();
    if (!session?.user?.operator_name) throw new Error("Unauthorized");

    try {
        await dbQuery(`DELETE FROM GOALS WHERE GOAL_ID = :id`, { id });
        revalidatePath('/goals');
        return { success: true };
    } catch (e: unknown) {
        return { success: false, error: (e as Error).message };
    }
}

/**
 * 10. Delete Rule
 */
export async function deleteRule(id: string) {
    const session = await auth();
    if (!session?.user?.operator_name) throw new Error("Unauthorized");

    try {
        await dbQuery(`DELETE FROM RULES WHERE RULE_ID = :id`, { id });
        revalidatePath('/goals');
        return { success: true };
    } catch (e: unknown) {
        return { success: false, error: (e as Error).message };
    }
}

export interface RuleView {
    id: string;
    type: string;
    metric: string;
    limitValue: number;
    window: number;
    severity: string;
    assignedTo?: string;
    actorHandle?: string;
}

/**
 * 6. Get Rules Dashboard Data
 */
export async function getRulesDashboardData(): Promise<RuleView[]> {
    try {
        const rules = await dbQuery<{
            RULE_ID: string;
            TYPE: string;
            METRIC: string;
            LIMIT_VALUE: number;
            TIME_WINDOW_SEC: number;
            SEVERITY: string;
            OPR_NAME?: string;
            ACT_USERNAME?: string;
        }>(`
            SELECT 
                r.RULE_ID, 
                r.TYPE, 
                r.METRIC, 
                r.LIMIT_VALUE, 
                r.TIME_WINDOW_SEC, 
                r.SEVERITY,
                o.OPR_NAME,
                a.ACT_USERNAME
            FROM RULES r
            LEFT JOIN OPERATORS o ON r.ASSIGNED_TO_OPR = o.OPR_ID
            LEFT JOIN ACTORS a ON r.ASSIGNED_TO_ACT = a.ACT_ID
            WHERE r.STATUS = 'Active'
            ORDER BY r.CREATED_AT DESC
        `);

        return rules.map((r) => ({
            id: r.RULE_ID,
            type: r.TYPE,
            metric: r.METRIC,
            limitValue: r.LIMIT_VALUE,
            window: r.TIME_WINDOW_SEC,
            severity: r.SEVERITY,
            assignedTo: r.OPR_NAME,
            actorHandle: r.ACT_USERNAME
        }));
    } catch (e) {
        console.error("Rules fetch failed:", e);
        return [];
    }
}