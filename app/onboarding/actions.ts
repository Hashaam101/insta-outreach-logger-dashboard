'use server';

import { auth } from "@/auth";
import { dbQuery, dbQuerySingle } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Establishment of Operator Identity
 * Used during the onboarding flow.
 */
export async function setOperatorName(name: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Authentication required" };
  }

  try {
    // 1. Check if name is already claimed by someone else
    const existing = await dbQuerySingle<{ EMAIL: string }>(
        `SELECT email FROM users WHERE operator_name = :name`,
        { name }
    );

    if (existing && existing.EMAIL !== session.user.email) {
        return { success: false, error: "This name is already claimed by another operator." };
    }

    // 2. Upsert into OPERATORS table
    await dbQuery(
        `MERGE INTO operators t
         USING (SELECT :name as op_name FROM DUAL) s
         ON (t.operator_name = s.op_name)
         WHEN NOT MATCHED THEN
            INSERT (operator_name, created_at) VALUES (s.op_name, SYSTIMESTAMP)`,
        { name }
    );

    // 3. Link user to operator
    await dbQuery(
        `UPDATE users SET operator_name = :name WHERE email = :email`,
        { name, email: session.user.email }
    );

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error("Onboarding Error:", error);
    return { success: false, error: "Database synchronization failed" };
  }
}
