import { dbQuery } from "./db";
import { unstable_cache } from "next/cache";
import { cache } from "react";

/**
 * 🛠️ CACHE LAYER 1: Request Memoization (React cache)
 * This ensures that if multiple components call these functions 
 * in a single request, the DB is only hit once.
 */

export interface GlobalStats {
  PROSPECTS_TOTAL: string;
  LOGS_TOTAL: string;
  ACTORS_TOTAL: string;
  OPERATORS_TOTAL: string;
}

/**
 * KPI Stats - Consolidated for Overview
 */
export const getCachedStats = cache(unstable_cache(
  async () => {
    const results = await dbQuery<GlobalStats>(`
      SELECT 
        TO_CHAR((SELECT COUNT(*) FROM PROSPECTS)) as PROSPECTS_TOTAL,
        TO_CHAR((SELECT COUNT(*) FROM OUTREACH_LOGS)) as LOGS_TOTAL,
        TO_CHAR((SELECT COUNT(*) FROM ACTORS)) as ACTORS_TOTAL,
        TO_CHAR((SELECT COUNT(*) FROM OPERATORS)) as OPERATORS_TOTAL
      FROM DUAL
    `);
    return results[0];
  },
  ["dashboard-stats-v5"],
  { revalidate: 60, tags: ["stats", "global"] }
));

export interface DashboardMetrics {
  TOTAL_DMS: string;
  BOOKED_LEADS: string;
  POSITIVE_REPLIES: string;
  ACTIVE_24H: string;
}

/**
 * Outreach Metrics - Specialized for My vs Team
 */
export const getCachedDashboardMetrics = cache(unstable_cache(
    async (operatorName?: string) => {
        const logFilter = operatorName 
            ? `JOIN ACTORS a ON l.ACTOR_USERNAME = a.USERNAME WHERE a.OWNER_OPERATOR = :op`
            : ``;
        
        const prospectFilterBase = operatorName
            ? `JOIN ACTORS a ON p.OWNER_ACTOR = a.USERNAME WHERE a.OWNER_OPERATOR = :op`
            : `WHERE 1=1`;

        const res = await dbQuery<DashboardMetrics>(`
            SELECT 
                TO_CHAR((SELECT COUNT(*) FROM OUTREACH_LOGS l ${logFilter})) as TOTAL_DMS,
                TO_CHAR((SELECT COUNT(*) FROM PROSPECTS p ${prospectFilterBase} AND p.STATUS = 'Booked')) as BOOKED_LEADS,
                TO_CHAR((SELECT COUNT(*) FROM PROSPECTS p ${prospectFilterBase} AND p.STATUS IN ('Reply Received', 'Warm'))) as POSITIVE_REPLIES,
                TO_CHAR((SELECT COUNT(*) FROM PROSPECTS p ${prospectFilterBase} AND p.LAST_UPDATED >= SYSDATE - 1)) as ACTIVE_24H
            FROM DUAL
        `, operatorName ? { op: operatorName } : {});
        
        return res[0];
    },
    ["dashboard-metrics-v3"],
    { revalidate: 60, tags: ["logs", "prospects", "metrics"] }
));

export interface ActorWithStats {
  USERNAME: string;
  OWNER_OPERATOR: string;
  STATUS: string;
  TOTAL_DMS: string;
  TOTAL_BOOKED: string;
}

/**
 * Actor Performance
 */
export const getCachedActorsWithStats = cache(unstable_cache(
    async (operatorName?: string) => {
        const query = `
            SELECT 
                a.USERNAME, 
                a.OWNER_OPERATOR, 
                a.STATUS,
                TO_CHAR((SELECT COUNT(*) FROM OUTREACH_LOGS WHERE ACTOR_USERNAME = a.USERNAME)) as TOTAL_DMS,
                TO_CHAR((SELECT COUNT(*) FROM PROSPECTS WHERE OWNER_ACTOR = a.USERNAME AND STATUS = 'Booked')) as TOTAL_BOOKED
            FROM ACTORS a
            ${operatorName ? 'WHERE a.OWNER_OPERATOR = :op' : ''}
            ORDER BY TOTAL_DMS DESC
        `;
        return await dbQuery<ActorWithStats>(query, operatorName ? { op: operatorName } : {});
    },
    ["actors-stats-v3"],
    { revalidate: 300, tags: ["actors", "logs"] }
));

export interface OutreachLog {
  TARGET_USERNAME: string;
  MESSAGE_TEXT: string;
  CREATED_AT: string;
  OWNER_OPERATOR: string;
  ACTOR_USERNAME: string;
}

/**
 * Recent Activity
 */
export const getCachedRecentLogs = cache(unstable_cache(
    async (operatorName?: string) => {
        const query = `
            SELECT l.TARGET_USERNAME, l.MESSAGE_TEXT, l.CREATED_AT, a.OWNER_OPERATOR, l.ACTOR_USERNAME
            FROM OUTREACH_LOGS l
            LEFT JOIN ACTORS a ON l.ACTOR_USERNAME = a.USERNAME
            ${operatorName ? 'WHERE a.OWNER_OPERATOR = :op' : ''}
            ORDER BY l.CREATED_AT DESC
            FETCH FIRST 10 ROWS ONLY
        `;
        return await dbQuery<OutreachLog>(query, operatorName ? { op: operatorName } : {});
    },
    ["recent-logs-v3"],
    { revalidate: 30, tags: ["logs", "recent"] }
));

export interface VolumeData {
  LOG_DATE: string;
  TOTAL: string;
}

/**
 * Outreach Volume (Analytics) - Longer cache
 */
export const getCachedOutreachVolume = cache(unstable_cache(
    async (days: number = 14) => {
        const res = await dbQuery<VolumeData>(`
            SELECT TO_CHAR(TRUNC(CREATED_AT), 'YYYY-MM-DD') as LOG_DATE, TO_CHAR(COUNT(*)) as TOTAL 
            FROM OUTREACH_LOGS 
            WHERE CREATED_AT >= SYSDATE - :days
            GROUP BY TRUNC(CREATED_AT) 
            ORDER BY LOG_DATE ASC
        `, { days });
        return res;
    },
    ["outreach-volume-v3"],
    { revalidate: 3600, tags: ["logs", "analytics"] }
));

export interface OperatorPerformance {
  NAME: string;
  TOTAL: string;
}

/**
 * Operator Performance (Leaderboard)
 */
export const getCachedOperatorPerformance = cache(unstable_cache(
    async (days: number = 30) => {
        return await dbQuery<OperatorPerformance>(`
            SELECT a.OWNER_OPERATOR as NAME, TO_CHAR(COUNT(*)) as TOTAL 
            FROM OUTREACH_LOGS l
            JOIN ACTORS a ON l.ACTOR_USERNAME = a.USERNAME
            WHERE l.CREATED_AT >= SYSDATE - :days
            GROUP BY a.OWNER_OPERATOR
            ORDER BY TOTAL DESC
        `, { days });
    },
    ["op-performance-v3"],
    { revalidate: 3600, tags: ["logs", "actors", "analytics"] }
));

export interface HeatmapData {
  HOUR: string;
  TOTAL: string;
}

/**
 * Activity Heatmap
 */
export const getCachedActivityHeatmap = cache(unstable_cache(
    async () => {
        return await dbQuery<HeatmapData>(`
            SELECT TO_CHAR(CREATED_AT, 'HH24') as HOUR, TO_CHAR(COUNT(*)) as TOTAL 
            FROM OUTREACH_LOGS 
            WHERE CREATED_AT >= SYSDATE - 30
            GROUP BY TO_CHAR(CREATED_AT, 'HH24')
            ORDER BY HOUR ASC
        `);
    },
    ["activity-heatmap-v3"],
    { revalidate: 3600, tags: ["logs", "analytics"] }
));

export interface EnrichmentStats {
  TOTAL: string;
  WITH_EMAIL: string;
  WITH_PHONE: string;
}

/**
 * Enrichment Health
 */
export const getCachedEnrichmentStats = cache(unstable_cache(
    async (days: number = 30) => {
        const res = await dbQuery<EnrichmentStats>(`
            SELECT 
                TO_CHAR(COUNT(*)) as TOTAL,
                TO_CHAR(COUNT(EMAIL)) as WITH_EMAIL,
                TO_CHAR(COUNT(PHONE_NUMBER)) as WITH_PHONE
            FROM PROSPECTS
            WHERE LAST_UPDATED >= SYSDATE - :days
        `, { days });
        return res[0];
    },
    ["enrichment-v3"],
    { revalidate: 3600, tags: ["prospects", "analytics"] }
));

export interface StatusDistributionData {
  STATUS: string;
  COUNT: string;
}

/**
 * Status Distribution
 */
export const getCachedStatusDistribution = cache(unstable_cache(
  async (operatorName?: string) => {
    const query = `
        SELECT p.status as STATUS, TO_CHAR(COUNT(*)) as COUNT 
        FROM PROSPECTS p
        ${operatorName ? 'JOIN ACTORS a ON p.OWNER_ACTOR = a.USERNAME WHERE a.OWNER_OPERATOR = :op' : ''}
        GROUP BY p.status 
        ORDER BY COUNT DESC
    `;
    return await dbQuery<StatusDistributionData>(query, operatorName ? { op: operatorName } : {});
  },
  ["status-dist-v3"],
  { revalidate: 300, tags: ["prospects", "metrics"] }
));

export interface TopActorData {
  ACTOR_USERNAME: string;
  COUNT: string;
}

/**
 * Top Actors (Leaderboard)
 */
export const getCachedTopActors = cache(unstable_cache(
  async () => {
    return await dbQuery<TopActorData>(`
        SELECT actor_username as ACTOR_USERNAME, TO_CHAR(COUNT(*)) as COUNT 
        FROM OUTREACH_LOGS 
        GROUP BY actor_username 
        ORDER BY COUNT DESC 
        FETCH FIRST 5 ROWS ONLY
    `);
  },
  ["top-actors-v4"],
  { revalidate: 300, tags: ["logs", "actors"] }
));

export interface OperatorStatsData {
  MY_LOGS_24H: string;
  TEAM_LOGS_24H: string;
  ACTIVE_OPERATORS: string;
}

/**
 * Operator Personal Stats
 */
export const getCachedOperatorStats = cache(unstable_cache(
    async (operatorName: string) => {
        const res = await dbQuery<OperatorStatsData>(`
            SELECT 
                TO_CHAR((SELECT COUNT(*) FROM OUTREACH_LOGS l 
                 JOIN ACTORS a ON l.ACTOR_USERNAME = a.USERNAME 
                 WHERE a.OWNER_OPERATOR = :op AND l.CREATED_AT >= SYSDATE - 1)) as MY_LOGS_24H,
                TO_CHAR((SELECT COUNT(*) FROM OUTREACH_LOGS WHERE CREATED_AT >= SYSDATE - 1)) as TEAM_LOGS_24H,
                TO_CHAR((SELECT COUNT(DISTINCT OWNER_OPERATOR) FROM ACTORS)) as ACTIVE_OPERATORS
            FROM DUAL
        `, { op: operatorName });
        
        return res[0];
    },
    ["op-personal-v4"],
    { revalidate: 60, tags: ["logs", "metrics"] }
));