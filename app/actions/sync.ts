'use server';

import { auth } from "@/auth";
import { dbQuery, clearCache } from "@/lib/db";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/ratelimit";

const SYNC_COOKIE = "last_sync_ts";

interface SyncStatus {
  hasChanges: boolean;
  lastSyncAt: string | null;
  latestActivityAt: string | null;
  changesSummary?: {
    newLogs: number;
    updatedTargets: number;
    actorChanges: number;
  };
}

interface LatestTimestamps {
  LATEST_LOG: string | null;
  LATEST_TARGET: string | null;
  LATEST_ACTOR: string | null;
  LATEST_OVERALL: string | null;
}

/**
 * Check if there are any changes since last sync
 * Compares timestamps across EVENT_LOGS, TARGETS, and ACTORS tables
 */
export async function checkSyncStatus(): Promise<SyncStatus> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const cookieStore = await cookies();
  const lastSyncCookie = cookieStore.get(SYNC_COOKIE)?.value;
  const lastSyncAt = lastSyncCookie || null;

  try {
    // Get latest timestamps from all relevant tables
    // Using a fixed historical date (2000-01-01) as fallback to prevent dynamic SYSDATE shifting
    const [timestamps] = await dbQuery<LatestTimestamps & { CURRENT_DB_TIME: string }>(`
      SELECT
        TO_CHAR((SELECT MAX(CREATED_AT) FROM EVENT_LOGS), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as LATEST_LOG,
        TO_CHAR((SELECT MAX(LAST_UPDATED) FROM TARGETS), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as LATEST_TARGET,
        TO_CHAR((SELECT MAX(LAST_ACTIVITY) FROM ACTORS), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as LATEST_ACTOR,
        TO_CHAR(GREATEST(
          NVL((SELECT MAX(CREATED_AT) FROM EVENT_LOGS), TO_DATE('2000-01-01', 'YYYY-MM-DD')),
          NVL((SELECT MAX(LAST_UPDATED) FROM TARGETS), TO_DATE('2000-01-01', 'YYYY-MM-DD')),
          NVL((SELECT MAX(LAST_ACTIVITY) FROM ACTORS), TO_DATE('2000-01-01', 'YYYY-MM-DD'))
        ), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as LATEST_OVERALL,
        TO_CHAR(SYSDATE, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as CURRENT_DB_TIME
      FROM DUAL
    `);

    const latestActivityAt = timestamps?.LATEST_OVERALL || null;
    const currentDbTime = timestamps?.CURRENT_DB_TIME || new Date().toISOString();

    // No previous sync - set initial checkpoint to current activity or current time
    if (!lastSyncAt) {
      const initialPoint = latestActivityAt || currentDbTime;
      cookieStore.set(SYNC_COOKIE, initialPoint, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });
      return {
        hasChanges: false,
        lastSyncAt: initialPoint,
        latestActivityAt,
      };
    }

    // Compare timestamps
    // String comparison works for ISO8601 strings
    const hasChanges = latestActivityAt !== null && latestActivityAt > lastSyncAt;

    if (hasChanges) {
        console.log(`[SYNC] Changes detected: Latest Data (${latestActivityAt}) > Last Sync (${lastSyncAt})`);
    }

    return {
      hasChanges,
      lastSyncAt,
      latestActivityAt,
    };
  } catch (error) {
    console.error("Failed to check sync status:", error);
    // On error, assume changes exist to be safe
    return {
      hasChanges: true,
      lastSyncAt,
      latestActivityAt: null,
    };
  }
}

/**
 * Get delta changes since last sync
 */
export async function getDeltaChanges(): Promise<{
  newLogs: number;
  updatedTargets: number;
  actorChanges: number;
} | null> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const cookieStore = await cookies();
  const lastSyncAt = cookieStore.get(SYNC_COOKIE)?.value;

  if (!lastSyncAt) return null;

  try {
    const [counts] = await dbQuery<{
      NEW_LOGS: string;
      UPDATED_TARGETS: string;
      ACTOR_CHANGES: string;
    }>(`
      SELECT
        TO_CHAR((
          SELECT COUNT(*) FROM EVENT_LOGS
          WHERE CREATED_AT > TO_TIMESTAMP(:lastSync, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
        )) as NEW_LOGS,
        TO_CHAR((
          SELECT COUNT(*) FROM TARGETS
          WHERE LAST_UPDATED > TO_TIMESTAMP(:lastSync, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
        )) as UPDATED_TARGETS,
        TO_CHAR((
          SELECT COUNT(*) FROM ACTORS
          WHERE LAST_ACTIVITY > TO_TIMESTAMP(:lastSync, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
        )) as ACTOR_CHANGES
      FROM DUAL
    `, { lastSync: lastSyncAt });

    return {
      newLogs: parseInt(counts?.NEW_LOGS || '0', 10),
      updatedTargets: parseInt(counts?.UPDATED_TARGETS || '0', 10),
      actorChanges: parseInt(counts?.ACTOR_CHANGES || '0', 10),
    };
  } catch {
    return null;
  }
}

/**
 * Internal helper to complete a sync operation
 * Invalidates caches and updates the sync cookie to the NEW checkpoint
 */
export async function completeSync(targetTimestamp?: string | null) {
  let now = targetTimestamp;
  
  if (!now) {
    const [dbTime] = await dbQuery<{ NOW: string }>(`SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as NOW FROM DUAL`);
    now = dbTime?.NOW || new Date().toISOString();
  }
  
  // Clear in-memory LRU cache
  clearCache();

  // Full invalidation
  revalidateTag("stats", "max");
  revalidateTag("global", "max");
  revalidateTag("logs", "max");
  revalidateTag("prospects", "max");
  revalidateTag("metrics", "max");
  revalidateTag("actors", "max");
  revalidateTag("recent", "max");
  revalidateTag("analytics", "max");

  const cookieStore = await cookies();
  cookieStore.set(SYNC_COOKIE, now, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: "lax",
  });

  return now;
}

/**
 * Smart sync - only refreshes cache if changes exist
 * Returns detailed sync result
 */
export async function smartSync(): Promise<{
  success: boolean;
  synced: boolean;
  message: string;
  delta?: {
    newLogs: number;
    updatedTargets: number;
    actorChanges: number;
  };
  timestamp?: string;
}> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Rate limit: 10 syncs per minute per user
  const { success: rateLimitOk } = rateLimit(`sync_${session.user.email}`, 10);
  if (!rateLimitOk) {
    return {
      success: false,
      synced: false,
      message: "Rate limit exceeded. Please wait a moment.",
    };
  }

  try {
    // Check if sync is needed
    const status = await checkSyncStatus();

    if (!status.hasChanges) {
      return {
        success: true,
        synced: false,
        message: "Already up to date. No new changes detected.",
      };
    }

    // Get delta details before syncing
    const delta = await getDeltaChanges();

    // Perform the sync completion using the activity timestamp we just found
    // This moves the checkpoint exactly to the newest record found
    const now = await completeSync(status.latestActivityAt);

    const totalChanges = delta
      ? delta.newLogs + delta.updatedTargets + delta.actorChanges
      : 0;

    return {
      success: true,
      synced: true,
      message: delta
        ? `Synced ${totalChanges} change${totalChanges !== 1 ? 's' : ''}`
        : "Full sync completed",
      delta: delta || undefined,
      timestamp: now,
    };
  } catch (error) {
    console.error("Smart sync failed:", error);
    return {
      success: false,
      synced: false,
      message: "Sync failed. Please try again.",
    };
  }
}

/**
 * Force full sync - bypasses delta check
 */
export async function forceSync(): Promise<{
  success: boolean;
  timestamp?: string;
}> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const { success: rateLimitOk } = rateLimit(`force_sync_${session.user.email}`, 5);
  if (!rateLimitOk) {
    return { success: false };
  }

  try {
    const now = await completeSync();
    return { success: true, timestamp: now };
  } catch {
    return { success: false };
  }
}
