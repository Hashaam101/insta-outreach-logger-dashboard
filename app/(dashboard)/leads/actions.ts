'use server';

import { auth } from "@/auth";
import { dbQuery, clearCache } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { rateLimit } from "@/lib/ratelimit";
import { z } from "zod";
import { completeSync } from "@/app/actions/sync";

// --- VALIDATION SCHEMAS ---
const StatusSchema = z.object({
    username: z.string().min(1).max(255),
    status: z.enum([
        "Cold No Reply", 
        "Replied", 
        "Warm", 
        "Booked", 
        "Paid", 
        "Tableturnerr Client", 
        "Excluded"
    ])
});

const NoteSchema = z.object({
    username: z.string().min(1).max(255),
    text: z.string().max(4000) // Oracle VARCHAR/TEXT limit safety
});

// --- ACTIONS ---

export async function refreshData() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    // Rate limit: 5 refreshes per minute per user
    const { success } = rateLimit(`refresh_${session.user.email}`, 5);
    if (!success) throw new Error("Rate limit exceeded. Please wait a minute.");

    try {
        // Clear in-memory LRU cache
        clearCache();

        // Invalidate all Next.js cache tags
        revalidateTag("stats", "max");
        revalidateTag("global", "max");
        revalidateTag("logs", "max");
        revalidateTag("prospects", "max");
        revalidateTag("metrics", "max");
        revalidateTag("actors", "max");
        revalidateTag("recent", "max");
        revalidateTag("analytics", "max");

        // Also revalidate all paths
        revalidatePath("/", "layout");

        return { success: true, timestamp: new Date().toISOString() };
    } catch {
        return { success: false };
    }
}

export async function updateLeadStatus(username: string, newStatus: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  
  // Rate limit: 20 updates per minute
  const { success: limitOk } = rateLimit(`update_${session.user.email}`, 20);
  if (!limitOk) throw new Error("Too many updates. Slow down.");

  // Validate Input
  const validated = StatusSchema.parse({ username, status: newStatus });

  try {
    // Fetch old status for logging
    const current = await dbQuerySingle<{ TAR_STATUS: string, TAR_ID: string }>(
        `SELECT TAR_STATUS, TAR_ID FROM TARGETS WHERE TAR_USERNAME = :u`,
        { u: username }
    );

    await dbQuery(
      `UPDATE TARGETS SET TAR_STATUS = :status, LAST_UPDATED = SYSTIMESTAMP WHERE TAR_USERNAME = :username`,
      { status: validated.status, username: validated.username }
    );
    
    // Log User Action
    if (current) {
        const op = await dbQuerySingle<{ OPR_ID: string }>(
            `SELECT OPR_ID FROM OPERATORS WHERE OPR_EMAIL = :e`, 
            { e: session.user.email }
        );
        if (op) {
            const elgId = `ELG-${Date.now().toString(16).slice(-6).toUpperCase()}${Math.floor(Math.random()*100)}`;
            await dbQuery(
                `INSERT INTO EVENT_LOGS (ELG_ID, EVENT_TYPE, OPR_ID, TAR_ID, DETAILS, CREATED_AT)
                 VALUES (:id, 'User', :opr, :tar, :details, SYSTIMESTAMP)`,
                { 
                    id: elgId, 
                    opr: op.OPR_ID, 
                    tar: current.TAR_ID,
                    details: `Status Change = [Status: ${current.TAR_STATUS} -> ${validated.status}]`
                }
            );
        }
    }
    
    await completeSync();
    
    revalidatePath('/leads');
    revalidateTag('prospects', "max");
    return { success: true };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: "Database error" };
  }
}

/**
 * Updates the single NOTES field for a Target
 */
export async function updateLeadNote(username: string, noteText: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const { success: limitOk } = rateLimit(`note_${session.user.email}`, 10);
  if (!limitOk) throw new Error("Too many notes. Slow down.");

  const validated = NoteSchema.parse({ username, text: noteText });

  try {
    const target = await dbQuerySingle<{ TAR_ID: string }>(
        `SELECT TAR_ID FROM TARGETS WHERE TAR_USERNAME = :u`,
        { u: username }
    );

    await dbQuery(
      `UPDATE TARGETS SET NOTES = :note_text, LAST_UPDATED = SYSTIMESTAMP WHERE TAR_USERNAME = :username`,
      { 
        username: validated.username, 
        note_text: validated.text
      }
    );

    // Log User Action
    if (target) {
        const op = await dbQuerySingle<{ OPR_ID: string }>(
            `SELECT OPR_ID FROM OPERATORS WHERE OPR_EMAIL = :e`, 
            { e: session.user.email }
        );
        if (op) {
            const elgId = `ELG-${Date.now().toString(16).slice(-6).toUpperCase()}${Math.floor(Math.random()*100)}`;
            await dbQuery(
                `INSERT INTO EVENT_LOGS (ELG_ID, EVENT_TYPE, OPR_ID, TAR_ID, DETAILS, CREATED_AT)
                 VALUES (:id, 'User', :opr, :tar, 'Update = [Notes: persistent note updated]', SYSTIMESTAMP)`,
                { id: elgId, opr: op.OPR_ID, tar: target.TAR_ID }
            );
        }
    }

    await completeSync();

    revalidatePath('/leads');
    revalidateTag('prospects', "max");
    return { success: true };
  } catch (error) {
    console.error("Failed to update note:", error);
    return { success: false, error: "Database error" };
  }
}

/**
 * Get the current note for a target
 */
export async function getLeadNote(username: string) {
    // Validation
    const safeUsername = z.string().min(1).parse(username);

    try {
        const result = await dbQuery<{ NOTES: string }>(
            `SELECT NOTES FROM TARGETS WHERE TAR_USERNAME = :username`,
            { username: safeUsername }
        );
        return result[0]?.NOTES || "";
    } catch (error) {
        console.error("Failed to fetch note:", error);
        return "";
    }
}

/**
 * Fetch all active actors for transfer dropdown
 */
export async function getActors() {
    try {
        return await dbQuery<{ USERNAME: string }>(
            `SELECT DISTINCT ACT_USERNAME as USERNAME FROM ACTORS WHERE ACT_STATUS = 'Active' ORDER BY ACT_USERNAME ASC`
        );
    } catch {
        return [];
    }
}
