'use server';

import { auth } from "@/auth";
import { dbQuery, dbQueryCached, invalidateCache } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * UTILITY: Log an action to the AUDIT_LOGS table
 */
async function logAudit(performedBy: string, actionType: string, targetId: string, details: object) {
    try {
        await dbQuery(
            `INSERT INTO audit_logs (performed_by, action_type, target_id, details_json) 
             VALUES (:by, :type, :target, :details)`,
            {
                by: performedBy,
                type: actionType,
                target: targetId,
                details: JSON.stringify(details)
            }
        );
    } catch (e) {
        console.error("Audit log failed:", e);
    }
}

/**
 * 1. Transfer Actor Ownership
 * Updates the OWNER_OPERATOR in the ACTORS table.
 */
export async function transferActor(actorHandle: string, newOperatorName: string) {
    const session = await auth();
    if (!session?.user?.operator_name) throw new Error("Unauthorized");

    try {
        // Fetch current owner for audit
        const current = await dbQuery<{ OWNER_OPERATOR: string }>(
            `SELECT owner_operator FROM actors WHERE username = :handle`,
            { handle: actorHandle }
        );

        if (current.length === 0) throw new Error("Actor not found");

        await dbQuery(
            `UPDATE actors SET owner_operator = :new_owner WHERE username = :handle`,
            { new_owner: newOperatorName, handle: actorHandle }
        );

        await logAudit(
            session.user.operator_name, 
            'TRANSFER_ACTOR', 
            actorHandle, 
            { from: current[0].OWNER_OPERATOR, to: newOperatorName }
        );

        revalidatePath('/settings');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * 2. Update Actor Status
 * Updates the STATUS in the ACTORS table.
 */
export async function updateActorStatus(actorHandle: string, newStatus: string) {
    const session = await auth();
    if (!session?.user?.operator_name) throw new Error("Unauthorized");

    // Validate status
    const validStatuses = ['ACTIVE', 'PAUSED', 'SUSPENDED', 'BANNED'];
    if (!validStatuses.includes(newStatus)) {
        return { success: false, error: "Invalid status" };
    }

    try {
        const current = await dbQuery<{ STATUS: string }>(
            `SELECT status FROM actors WHERE username = :handle`,
            { handle: actorHandle }
        );

        if (current.length === 0) throw new Error("Actor not found");

        await dbQuery(
            `UPDATE actors SET status = :status WHERE username = :handle`,
            { status: newStatus, handle: actorHandle }
        );

        invalidateCache('actors');

        await logAudit(
            session.user.operator_name,
            'UPDATE_ACTOR_STATUS',
            actorHandle,
            { from: current[0].STATUS, to: newStatus }
        );

        revalidatePath('/actors');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * 3. Transfer Lead Ownership
 * Updates the OWNER_ACTOR in the PROSPECTS table.
 */
export async function transferLead(targetUsername: string, newActorHandle: string) {
    const session = await auth();
    if (!session?.user?.operator_name) throw new Error("Unauthorized");

    try {
        const current = await dbQuery<{ OWNER_ACTOR: string }>(
            `SELECT owner_actor FROM prospects WHERE target_username = :target`,
            { target: targetUsername }
        );

        if (current.length === 0) throw new Error("Lead not found");

        await dbQuery(
            `UPDATE prospects SET owner_actor = :new_actor, last_updated = SYSTIMESTAMP WHERE target_username = :target`,
            { new_actor: newActorHandle, target: targetUsername }
        );

        await logAudit(
            session.user.operator_name,
            'TRANSFER_LEAD',
            targetUsername,
            { from: current[0].OWNER_ACTOR, to: newActorHandle }
        );

        revalidatePath('/leads');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * 3. Suggest Team Goal
 * Upserts into TEAM_GOALS.
 */
export async function suggestTeamGoal(key: string, value: number, description: string) {
    const session = await auth();
    if (!session?.user?.operator_name) throw new Error("Unauthorized");

    try {
        // Using Oracle's MERGE for Upsert
        await dbQuery(`
            MERGE INTO team_goals t
            USING (SELECT :key as goal_key FROM DUAL) s
            ON (t.goal_key = s.goal_key)
            WHEN MATCHED THEN
                UPDATE SET suggested_value = :val, suggested_by = :by, description = :desc, updated_at = SYSTIMESTAMP
            WHEN NOT MATCHED THEN
                INSERT (goal_key, suggested_value, suggested_by, description)
                VALUES (:key, :val, :by, :desc)
        `, {
            key,
            val: value,
            by: session.user.operator_name,
            desc: description
        });

        await logAudit(session.user.operator_name, 'UPDATE_TEAM_GOAL', key, { value });

        revalidatePath('/analytics');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * 4. Set Personal Goal
 * Upserts into OPERATOR_GOALS.
 */
export async function setPersonalGoal(key: string, value: number) {
    const session = await auth();
    if (!session?.user?.operator_name) throw new Error("Unauthorized");

    try {
        await dbQuery(`
            MERGE INTO operator_goals o
            USING (SELECT :op as op_name, :key as g_key FROM DUAL) s
            ON (o.operator_name = s.op_name AND o.goal_key = s.g_key)
            WHEN MATCHED THEN
                UPDATE SET personal_value = :val
            WHEN NOT MATCHED THEN
                INSERT (operator_name, goal_key, personal_value)
                VALUES (:op, :key, :val)
        `, {
            op: session.user.operator_name,
            key,
            val: value
        });

        revalidatePath('/analytics');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * 5. Get Goals Dashboard Data
 * Returns a merged view of Team vs Personal goals.
 */
export async function getGoalsDashboardData() {
    const session = await auth();
    if (!session?.user?.operator_name) return null;

    try {
        // Query both tables joined on Goal Key for the current operator
        const goals = await dbQuery(`
            SELECT 
                t.goal_key, 
                t.description, 
                t.suggested_value, 
                t.suggested_by, 
                t.updated_at,
                o.personal_value
            FROM team_goals t
            LEFT JOIN operator_goals o ON t.goal_key = o.goal_key AND o.operator_name = :op
            ORDER BY t.goal_key ASC
        `, { op: session.user.operator_name });

        return goals.map((g: any) => ({
            key: g.GOAL_KEY,
            description: g.DESCRIPTION,
            teamValue: g.SUGGESTED_VALUE,
            suggestedBy: g.SUGGESTED_BY,
            updatedAt: g.UPDATED_AT,
            personalValue: g.PERSONAL_VALUE
        }));
    } catch (e) {
        console.error("Goals fetch failed:", e);
        return [];
    }
}

/**
 * 6. Get Recent Goal Changes
 */
export async function getRecentGoalChanges() {
    try {
        const logs = await dbQuery(`
            SELECT performed_by, action_type, target_id, details_json, timestamp
            FROM audit_logs
            WHERE action_type = 'UPDATE_TEAM_GOAL'
            ORDER BY timestamp DESC
            FETCH FIRST 5 ROWS ONLY
        `);

        return logs.map((l: any) => ({
            by: l.PERFORMED_BY,
            type: l.ACTION_TYPE,
            target: l.TARGET_ID,
            details: JSON.parse(l.DETAILS_JSON),
            at: l.TIMESTAMP
        }));
    } catch (e) {
        return [];
    }
}
