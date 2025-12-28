'use server';

import { auth } from "@/auth";
import { dbQuery, clearCache } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { rateLimit } from "@/lib/ratelimit";
import { z } from "zod";

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
        revalidateTag("stats");
        revalidateTag("global");
        revalidateTag("logs");
        revalidateTag("prospects");
        revalidateTag("metrics");
        revalidateTag("actors");
        revalidateTag("recent");
        revalidateTag("analytics");

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
    await dbQuery(
      `UPDATE TARGETS SET TAR_STATUS = :status, LAST_UPDATED = SYSTIMESTAMP WHERE TAR_USERNAME = :username`,
      { status: validated.status, username: validated.username }
    );
    
    // Also log this change in EVENT_LOGS? Ideally yes, but sticking to basic update for now to avoid complexity unless requested.
    
    revalidatePath('/leads');
    revalidateTag('prospects');
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
    await dbQuery(
      `UPDATE TARGETS SET NOTES = :note_text, LAST_UPDATED = SYSTIMESTAMP WHERE TAR_USERNAME = :username`,
      { 
        username: validated.username, 
        note_text: validated.text
      }
    );

    revalidatePath('/leads');
    revalidateTag('prospects');
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
            `SELECT ACT_USERNAME as USERNAME FROM ACTORS WHERE ACT_STATUS = 'Active' ORDER BY ACT_USERNAME ASC`
        );
    } catch {
        return [];
    }
}
