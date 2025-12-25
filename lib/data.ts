import { dbQueryCached, dbCountCached } from "./db";
import { unstable_cache } from "next/cache";
import { cache } from "react";

/**
 * FAST CACHING ARCHITECTURE:
 * 1. LRU in-memory cache (5 min TTL) - instant hits
 * 2. React cache - request deduplication
 * 3. Next.js unstable_cache - cross-request persistence
 *
 * All functions return safe defaults on error - no crashes
 */

// ============ DASHBOARD STATS ============

export const getCachedStats = cache(unstable_cache(
  async () => {
    const [prospects, logs, actors, operators] = await Promise.all([
      dbCountCached('SELECT COUNT(*) as CNT FROM PROSPECTS', {}, 'stats:prospects'),
      dbCountCached('SELECT COUNT(*) as CNT FROM OUTREACH_LOGS', {}, 'stats:logs'),
      dbCountCached('SELECT COUNT(*) as CNT FROM ACTORS', {}, 'stats:actors'),
      dbCountCached('SELECT COUNT(*) as CNT FROM OPERATORS', {}, 'stats:operators'),
    ]);

    return {
      PROSPECTS_TOTAL: String(prospects),
      LOGS_TOTAL: String(logs),
      ACTORS_TOTAL: String(actors),
      OPERATORS_TOTAL: String(operators),
    };
  },
  ["stats-v9"],
  { revalidate: 120, tags: ["stats"] }
));

// ============ DASHBOARD METRICS ============

export const getCachedDashboardMetrics = cache(unstable_cache(
  async (operatorName?: string) => {
    const opFilter = operatorName ? { op: operatorName } : {};
    const opKey = operatorName || 'team';

    const [totalDms, bookedLeads, positiveReplies, active24h] = await Promise.all([
      operatorName
        ? dbCountCached(
            `SELECT COUNT(*) as CNT FROM OUTREACH_LOGS l JOIN ACTORS a ON l.ACTOR_USERNAME = a.USERNAME WHERE a.OWNER_OPERATOR = :op`,
            opFilter, `metrics:dms:${opKey}`)
        : dbCountCached('SELECT COUNT(*) as CNT FROM OUTREACH_LOGS', {}, 'metrics:dms:team'),

      operatorName
        ? dbCountCached(
            `SELECT COUNT(*) as CNT FROM PROSPECTS p JOIN ACTORS a ON p.OWNER_ACTOR = a.USERNAME WHERE a.OWNER_OPERATOR = :op AND p.STATUS = 'Booked'`,
            opFilter, `metrics:booked:${opKey}`)
        : dbCountCached(`SELECT COUNT(*) as CNT FROM PROSPECTS WHERE STATUS = 'Booked'`, {}, 'metrics:booked:team'),

      operatorName
        ? dbCountCached(
            `SELECT COUNT(*) as CNT FROM PROSPECTS p JOIN ACTORS a ON p.OWNER_ACTOR = a.USERNAME WHERE a.OWNER_OPERATOR = :op AND p.STATUS IN ('Reply Received', 'Warm')`,
            opFilter, `metrics:replies:${opKey}`)
        : dbCountCached(`SELECT COUNT(*) as CNT FROM PROSPECTS WHERE STATUS IN ('Reply Received', 'Warm')`, {}, 'metrics:replies:team'),

      operatorName
        ? dbCountCached(
            `SELECT COUNT(*) as CNT FROM PROSPECTS p JOIN ACTORS a ON p.OWNER_ACTOR = a.USERNAME WHERE a.OWNER_OPERATOR = :op AND p.LAST_UPDATED >= SYSDATE - 1`,
            opFilter, `metrics:active:${opKey}`)
        : dbCountCached('SELECT COUNT(*) as CNT FROM PROSPECTS WHERE LAST_UPDATED >= SYSDATE - 1', {}, 'metrics:active:team'),
    ]);

    return {
      TOTAL_DMS: String(totalDms),
      BOOKED_LEADS: String(bookedLeads),
      POSITIVE_REPLIES: String(positiveReplies),
      ACTIVE_24H: String(active24h),
    };
  },
  ["metrics-v9"],
  { revalidate: 60, tags: ["metrics"] }
));

// ============ ACTORS ============

export const getCachedActorsWithStats = cache(unstable_cache(
  async (operatorName?: string) => {
    try {
      const sql = `
        SELECT a.USERNAME, a.OWNER_OPERATOR, a.STATUS,
          NVL(l.DM_COUNT, 0) as TOTAL_DMS,
          NVL(p.BOOKED_COUNT, 0) as TOTAL_BOOKED
        FROM ACTORS a
        LEFT JOIN (SELECT ACTOR_USERNAME, COUNT(*) as DM_COUNT FROM OUTREACH_LOGS GROUP BY ACTOR_USERNAME) l
          ON l.ACTOR_USERNAME = a.USERNAME
        LEFT JOIN (SELECT OWNER_ACTOR, COUNT(*) as BOOKED_COUNT FROM PROSPECTS WHERE STATUS = 'Booked' GROUP BY OWNER_ACTOR) p
          ON p.OWNER_ACTOR = a.USERNAME
        ${operatorName ? 'WHERE a.OWNER_OPERATOR = :op' : ''}
        ORDER BY TOTAL_DMS DESC`;

      return await dbQueryCached(sql, operatorName ? { op: operatorName } : {}, `actors:${operatorName || 'all'}`);
    } catch {
      return [];
    }
  },
  ["actors-v9"],
  { revalidate: 300, tags: ["actors"] }
));

// ============ RECENT LOGS ============

export const getCachedRecentLogs = cache(unstable_cache(
  async (operatorName?: string) => {
    try {
      const sql = `
        SELECT l.TARGET_USERNAME, l.MESSAGE_TEXT, l.CREATED_AT, a.OWNER_OPERATOR, l.ACTOR_USERNAME
        FROM OUTREACH_LOGS l
        LEFT JOIN ACTORS a ON l.ACTOR_USERNAME = a.USERNAME
        ${operatorName ? 'WHERE a.OWNER_OPERATOR = :op' : ''}
        ORDER BY l.CREATED_AT DESC
        FETCH FIRST 10 ROWS ONLY`;

      return await dbQueryCached(sql, operatorName ? { op: operatorName } : {}, `logs:recent:${operatorName || 'all'}`);
    } catch {
      return [];
    }
  },
  ["logs-v9"],
  { revalidate: 30, tags: ["logs"] }
));

// ============ ANALYTICS ============

export const getCachedOutreachVolume = cache(unstable_cache(
  async (days: number = 14) => {
    try {
      return await dbQueryCached(`
        SELECT TO_CHAR(TRUNC(CREATED_AT), 'YYYY-MM-DD') as LOG_DATE, COUNT(*) as TOTAL
        FROM OUTREACH_LOGS WHERE CREATED_AT >= SYSDATE - :days
        GROUP BY TRUNC(CREATED_AT) ORDER BY LOG_DATE ASC
      `, { days }, `analytics:volume:${days}`);
    } catch {
      return [];
    }
  },
  ["volume-v9"],
  { revalidate: 3600, tags: ["analytics"] }
));

export const getCachedOperatorPerformance = cache(unstable_cache(
  async (days: number = 30) => {
    try {
      return await dbQueryCached(`
        SELECT a.OWNER_OPERATOR as NAME, COUNT(*) as TOTAL
        FROM OUTREACH_LOGS l JOIN ACTORS a ON l.ACTOR_USERNAME = a.USERNAME
        WHERE l.CREATED_AT >= SYSDATE - :days
        GROUP BY a.OWNER_OPERATOR ORDER BY TOTAL DESC
      `, { days }, `analytics:perf:${days}`);
    } catch {
      return [];
    }
  },
  ["perf-v9"],
  { revalidate: 3600, tags: ["analytics"] }
));

export const getCachedActivityHeatmap = cache(unstable_cache(
  async () => {
    try {
      return await dbQueryCached(`
        SELECT TO_CHAR(CREATED_AT, 'HH24') as HOUR, COUNT(*) as TOTAL
        FROM OUTREACH_LOGS WHERE CREATED_AT >= SYSDATE - 30
        GROUP BY TO_CHAR(CREATED_AT, 'HH24') ORDER BY HOUR ASC
      `, {}, 'analytics:heatmap');
    } catch {
      return [];
    }
  },
  ["heatmap-v9"],
  { revalidate: 3600, tags: ["analytics"] }
));

export const getCachedEnrichmentStats = cache(unstable_cache(
  async (days: number = 30) => {
    try {
      const result = await dbQueryCached<{ TOTAL: string; WITH_EMAIL: string; WITH_PHONE: string }>(`
        SELECT COUNT(*) as TOTAL, COUNT(EMAIL) as WITH_EMAIL, COUNT(PHONE_NUMBER) as WITH_PHONE
        FROM PROSPECTS WHERE LAST_UPDATED >= SYSDATE - :days
      `, { days }, `analytics:enrichment:${days}`);

      const row = result[0] || { TOTAL: '0', WITH_EMAIL: '0', WITH_PHONE: '0' };
      return { TOTAL: row.TOTAL, WITH_EMAIL: row.WITH_EMAIL, WITH_PHONE: row.WITH_PHONE };
    } catch {
      return { TOTAL: '0', WITH_EMAIL: '0', WITH_PHONE: '0' };
    }
  },
  ["enrichment-v9"],
  { revalidate: 3600, tags: ["analytics"] }
));

// ============ STATUS & LEADS ============

export const getCachedStatusDistribution = cache(unstable_cache(
  async (operatorName?: string) => {
    try {
      const sql = `
        SELECT p.STATUS, COUNT(*) as COUNT FROM PROSPECTS p
        ${operatorName ? 'JOIN ACTORS a ON p.OWNER_ACTOR = a.USERNAME WHERE a.OWNER_OPERATOR = :op' : ''}
        GROUP BY p.STATUS ORDER BY COUNT DESC`;

      return await dbQueryCached(sql, operatorName ? { op: operatorName } : {}, `status:${operatorName || 'all'}`);
    } catch {
      return [];
    }
  },
  ["status-v9"],
  { revalidate: 300, tags: ["prospects"] }
));

export const getCachedTopActors = cache(unstable_cache(
  async () => {
    try {
      return await dbQueryCached(`
        SELECT ACTOR_USERNAME, COUNT(*) as COUNT FROM OUTREACH_LOGS
        GROUP BY ACTOR_USERNAME ORDER BY COUNT DESC FETCH FIRST 5 ROWS ONLY
      `, {}, 'top:actors');
    } catch {
      return [];
    }
  },
  ["topactors-v9"],
  { revalidate: 300, tags: ["actors"] }
));

// ============ OPERATOR STATS ============

export const getCachedOperatorStats = cache(unstable_cache(
  async (operatorName: string) => {
    if (!operatorName) {
      return { MY_LOGS_24H: '0', TEAM_LOGS_24H: '0', ACTIVE_OPERATORS: '0' };
    }

    const [myLogs, teamLogs, operators] = await Promise.all([
      dbCountCached(
        `SELECT COUNT(*) as CNT FROM OUTREACH_LOGS l JOIN ACTORS a ON l.ACTOR_USERNAME = a.USERNAME WHERE a.OWNER_OPERATOR = :op AND l.CREATED_AT >= SYSDATE - 1`,
        { op: operatorName }, `op:my:${operatorName}`),
      dbCountCached('SELECT COUNT(*) as CNT FROM OUTREACH_LOGS WHERE CREATED_AT >= SYSDATE - 1', {}, 'op:team:24h'),
      dbCountCached('SELECT COUNT(DISTINCT OWNER_OPERATOR) as CNT FROM ACTORS', {}, 'op:count'),
    ]);

    return {
      MY_LOGS_24H: String(myLogs),
      TEAM_LOGS_24H: String(teamLogs),
      ACTIVE_OPERATORS: String(operators),
    };
  },
  ["opstats-v9"],
  { revalidate: 60, tags: ["metrics"] }
));
