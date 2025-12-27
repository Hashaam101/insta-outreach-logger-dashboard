'use server';

import { auth } from "@/auth";
import { dbQuery } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/ratelimit";
import { z } from "zod";

// --- VALIDATION SCHEMAS ---
const StatusSchema = z.object({
    username: z.string().min(1).max(255),
    status: z.enum(["Not Contacted", "Contacted", "Reply Received", "Booked"])
});

const NoteSchema = z.object({
    username: z.string().min(1).max(255),
    text: z.string().min(1).max(2000)
});

// --- ACTIONS ---

export async function refreshData() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    // Rate limit: 5 refreshes per minute per user
    const { success } = rateLimit(`refresh_${session.user.email}`, 5);
    if (!success) throw new Error("Rate limit exceeded. Please wait a minute.");

    try {
        // Purge the entire dashboard cache
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

  // Validate Input (Prevents SQL Injection via malformed strings)
  const validated = StatusSchema.parse({ username, status: newStatus });

  try {
    // SECURITY: Always use bind variables (:status, :username) - NEVER use string interpolation
    await dbQuery(
      `UPDATE prospects SET status = :status, last_updated = SYSTIMESTAMP WHERE target_username = :username`,
      { status: validated.status, username: validated.username }
    );
    
    revalidatePath('/leads');
    return { success: true };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: "Database error" };
  }
}

export async function addLeadNote(username: string, noteText: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const { success: limitOk } = rateLimit(`note_${session.user.email}`, 10);
  if (!limitOk) throw new Error("Too many notes. Slow down.");

  const validated = NoteSchema.parse({ username, text: noteText });
  const operatorName = session.user.operator_name || 'Unknown';

  try {
    await dbQuery(
      `INSERT INTO notes (username, note_text, operator_name, created_at) VALUES (:username, :note_text, :operator, SYSTIMESTAMP)`,
      { 
        username: validated.username, 
        note_text: validated.text,
        operator: operatorName
      }
    );

    revalidatePath('/leads');
    return { success: true };
  } catch (error) {
    console.error("Failed to add note:", error);
    return { success: false, error: "Database error" };
  }
}

export async function getLeadNotes(username: string) {
    // Validation
    const safeUsername = z.string().min(1).parse(username);

    try {
        const notes = await dbQuery<{ ID: number, NOTE_TEXT: string, OPERATOR_NAME: string, CREATED_AT: string }>(
            `SELECT id, note_text, operator_name, created_at FROM notes WHERE username = :username ORDER BY created_at DESC`,
            { username: safeUsername }
        );
        return notes.map(n => ({
            id: n.ID,
            text: n.NOTE_TEXT,
            operator: n.OPERATOR_NAME,
            created_at: n.CREATED_AT
        }));
    } catch (error) {
        console.error("Failed to fetch notes:", error);
        return [];
    }
}

/**
 * Fetch all actors for transfer dropdown
 */
export async function getActors() {
    try {
        return await dbQuery<{ USERNAME: string }>(`SELECT username FROM actors WHERE status = 'ACTIVE' ORDER BY username ASC`);
    } catch {
        return [];
    }
}