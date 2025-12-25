'use server';

import { auth } from "@/auth";
import { dbQuery, dbQueryCached, invalidateCache } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function getExistingOperators() {
    try {
        // Fetch all names from OPERATORS table
        const operators = await dbQuery<{ OPERATOR_NAME: string }>(
            `SELECT operator_name FROM operators ORDER BY operator_name ASC`
        );
        
        // Fetch all CLAIMED names from USERS table
        const claimed = await dbQuery<{ OPERATOR_NAME: string }>(
            `SELECT operator_name FROM users WHERE operator_name IS NOT NULL`
        );

        const claimedSet = new Set(claimed.map(c => c.OPERATOR_NAME));

        return operators.map(op => ({
            name: op.OPERATOR_NAME,
            isClaimed: claimedSet.has(op.OPERATOR_NAME)
        }));
    } catch (error) {
        console.error("Failed to fetch operators:", error);
        return [];
    }
}

export async function setOperatorName(operatorName: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  if (!operatorName || operatorName.length < 3) {
    throw new Error("Invalid Operator Name");
  }

  try {
    // 1. Check if name is already claimed by someone else
    const claimedCheck = await dbQuery<{ EMAIL: string }>(
        `SELECT email FROM users WHERE operator_name = :name`,
        { name: operatorName }
    );

    if (claimedCheck.length > 0 && claimedCheck[0].EMAIL !== session.user.email) {
        return { success: false, error: "This operator name is already claimed by another user." };
    }

    // 2. Check if it exists in OPERATORS table, if not, create it
    const existsCheck = await dbQuery<{ OPERATOR_NAME: string }>(
        `SELECT operator_name FROM operators WHERE operator_name = :name`,
        { name: operatorName }
    );

    if (existsCheck.length === 0) {
        await dbQuery(
            `INSERT INTO operators (operator_name) VALUES (:name)`,
            { name: operatorName }
        );
    }

    // 3. Link to current user
    await dbQuery(
      `UPDATE users SET operator_name = :operator_name WHERE email = :email`,
      {
        operator_name: operatorName,
        email: session.user.email
      }
    );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to set operator name:", error);
    return { success: false, error: "Database update failed" };
  }
}