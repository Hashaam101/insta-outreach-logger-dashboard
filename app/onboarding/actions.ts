'use server';

import { auth, signOut } from "@/auth";
import { dbQuery, dbQuerySingle } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function signOutAction() {
    await signOut({ redirectTo: "/login" });
}

/**
 * Establishment of Operator Identity
 * Used during the onboarding flow.
 */
export async function setOperatorName(rawName: string, overrideEmail?: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Authentication required" };
  }

  // Identity Override: Only works in DEV mode
  const isDev = process.env.NODE_ENV === 'development';
  const email = (isDev && overrideEmail) ? overrideEmail : session.user.email;
  
  // Truncate to 32 chars as per schema
  const name = rawName.slice(0, 32);

  try {
    // 1. Check if I already exist
    const myRow = await dbQuerySingle<{ OPR_ID: string, OPR_NAME: string }>(
        `SELECT OPR_ID, OPR_NAME FROM OPERATORS WHERE OPR_EMAIL = :email`,
        { email }
    );

    // 2. Check if target Name exists
    const targetRow = await dbQuerySingle<{ OPR_ID: string, OPR_EMAIL: string }>(
        `SELECT OPR_ID, OPR_EMAIL FROM OPERATORS WHERE OPR_NAME = :name`,
        { name }
    );

    if (myRow && targetRow) {
        if (myRow.OPR_ID === targetRow.OPR_ID) {
            // I am already this operator. Do nothing.
            return { success: true };
        }
        // I exist, Target exists (and is distinct).
        // Cannot merge two existing operators easily without handling foreign keys.
        return { success: false, error: "Name is already taken by another operator." };
    }

    if (myRow && !targetRow) {
        // Case C: Rename myself
        await dbQuery(
            `UPDATE OPERATORS SET OPR_NAME = :name WHERE OPR_ID = :id`,
            { name, id: myRow.OPR_ID }
        );
    } else if (!myRow && targetRow) {
        // Case B: Claim existing (Seed) account
        // We overwrite the seed email with the real user email
        await dbQuery(
            `UPDATE OPERATORS SET OPR_EMAIL = :email WHERE OPR_ID = :id`,
            { email, id: targetRow.OPR_ID }
        );
    } else {
        // Case A: Fresh Insert
        const newId = `OPR-${Date.now().toString(16).slice(-8).toUpperCase()}`;
        await dbQuery(
            `INSERT INTO OPERATORS (OPR_ID, OPR_EMAIL, OPR_NAME, OPR_STATUS, CREATED_AT, LAST_ACTIVITY)
             VALUES (:id, :email, :name, 'online', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            { id: newId, email, name }
        );
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error("Onboarding Error:", error);
    return { success: false, error: "Database synchronization failed" };
  }
}
