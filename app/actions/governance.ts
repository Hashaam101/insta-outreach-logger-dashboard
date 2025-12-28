'use server';

import { auth } from "@/auth";
import { dbQuery, dbQuerySingle } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { GoalMetric, GoalFrequency } from "@/types/db";

/**
 * 1. Transfer Actor Ownership
 * Updates the OPR_ID in the ACTORS table.
 */
export async function transferActor(actorHandle: string, newOperatorName: string) {
    const session = await auth();
    if (!session?.user?.operator_name) throw new Error("Unauthorized");

    try {
        // 1. Get New Operator ID
        const newOp = await dbQuerySingle<{ OPR_ID: string }>(
            `SELECT OPR_ID FROM OPERATORS WHERE OPR_NAME = :name`,
            { name: newOperatorName }
        );

        if (!newOp) throw new Error(`Operator ${newOperatorName} not found`);

        // 2. Update Actor
        await dbQuery(
            `UPDATE ACTORS SET OPR_ID = :new_id WHERE ACT_USERNAME = :handle`,
            { new_id: newOp.OPR_ID, handle: actorHandle }
        );

        console.log(`AUDIT: Actor ${actorHandle} transferred to ${newOperatorName} by ${session.user.operator_name}`);

        revalidatePath('/settings');
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