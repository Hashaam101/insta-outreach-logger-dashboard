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
        TO_CHAR((SELECT COUNT(*) FROM TARGETS)) as PROSPECTS_TOTAL,
        TO_CHAR((SELECT COUNT(*) FROM OUTREACH_LOGS)) as LOGS_TOTAL,
        TO_CHAR((SELECT COUNT(*) FROM ACTORS)) as ACTORS_TOTAL,
        TO_CHAR((SELECT COUNT(*) FROM OPERATORS)) as OPERATORS_TOTAL
      FROM DUAL
    `);
    return results[0];
  },
  ["dashboard-stats-v7"],
  { revalidate: 600, tags: ["stats", "global"] }  // 10 min cache
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
    async (operatorName?: string) => { // operatorName is actually OPR_NAME
        // Filter logic: If operatorName is provided, we need to resolve OPR_ID first or join on OPR_NAME
        // Assuming operatorName corresponds to OPR_NAME in OPERATORS table.
        
        // For Targets (Prospects), we count distinct TARGETS contacted by this Operator's Actors
        const targetJoin = operatorName
            ? `JOIN EVENT_LOGS e ON t.TAR_ID = e.TAR_ID JOIN OPERATORS o ON e.OPR_ID = o.OPR_ID WHERE o.OPR_NAME = :op AND e.EVENT_TYPE = 'Outreach'`
            : `WHERE 1=1`;

        // Note: l.ACT_ID links OUTREACH_LOGS -> EVENT_LOGS -> ACTORS. 
        // Wait, OUTREACH_LOGS doesn't have ACT_ID directly, it links to EVENT_LOGS (ELG_ID).
        // Correct Path: OUTREACH_LOGS ol -> EVENT_LOGS el -> ACTORS a -> OPERATORS o
        
        const outreachJoin = operatorName
            ? `JOIN EVENT_LOGS el ON l.ELG_ID = el.ELG_ID JOIN OPERATORS o ON el.OPR_ID = o.OPR_ID WHERE o.OPR_NAME = :op`
            : ``;

        const res = await dbQuery<DashboardMetrics>(`
            SELECT 
                TO_CHAR((SELECT COUNT(*) FROM OUTREACH_LOGS l ${outreachJoin})) as TOTAL_DMS,
                TO_CHAR((SELECT COUNT(DISTINCT t.TAR_ID) FROM TARGETS t ${targetJoin} AND t.TAR_STATUS = 'Booked')) as BOOKED_LEADS,
                TO_CHAR((SELECT COUNT(DISTINCT t.TAR_ID) FROM TARGETS t ${targetJoin} AND t.TAR_STATUS IN ('Replied', 'Warm'))) as POSITIVE_REPLIES,
                TO_CHAR((SELECT COUNT(DISTINCT t.TAR_ID) FROM TARGETS t ${targetJoin} AND t.LAST_UPDATED >= SYSTIMESTAMP - 1)) as ACTIVE_24H
            FROM DUAL
        `, operatorName ? { op: operatorName } : {});
        
        return res[0] || { TOTAL_DMS: '0', BOOKED_LEADS: '0', POSITIVE_REPLIES: '0', ACTIVE_24H: '0' };
    },
    ["dashboard-metrics-v5"],
    { revalidate: 600, tags: ["logs", "prospects", "metrics"] }  // 10 min cache
));

export interface OperatorBasic {
  OPR_ID: string;
  OPR_NAME: string;
  OPR_EMAIL: string;
  OPR_STATUS: string;
}

/**
 * Get all operators (for dropdowns, etc.)
 * Cached to reduce DB calls
 */
export const getCachedOperators = cache(unstable_cache(
    async () => {
        return await dbQuery<OperatorBasic>(`
            SELECT OPR_ID, OPR_NAME, OPR_EMAIL, OPR_STATUS
            FROM OPERATORS
            ORDER BY OPR_NAME ASC
        `);
    },
    ["operators-list-v2"],
    { revalidate: 900, tags: ["operators"] }  // 15 min cache
));

export interface ActorBasic {
  ACT_ID: string;
  ACT_USERNAME: string;
  OPR_NAME: string;
}

/**
 * Get all actors (for dropdowns)
 */
export const getCachedActors = cache(unstable_cache(
    async () => {
        return await dbQuery<ActorBasic>(`
            SELECT a.ACT_ID, a.ACT_USERNAME, o.OPR_NAME
            FROM ACTORS a
            JOIN OPERATORS o ON a.OPR_ID = o.OPR_ID
            ORDER BY a.ACT_USERNAME ASC
        `);
    },
    ["actors-list-v1"],
    { revalidate: 900, tags: ["actors"] }
));

export interface ActorWithStats {
  ACT_ID: string;
  ACT_USERNAME: string;
  OPR_ID: string;
  OPR_NAME: string;
  ACT_STATUS: string;
  
  // Range 1 Personal
  P1_DMS: string;
  P1_TARGETS: string;
  P1_REPLIES: string;
  P1_WARM: string;
  P1_BOOKED: string;
  P1_PAID: string;
  
  // Range 1 Fleet (Global for actor handle)
  F1_DMS: string;
  F1_TARGETS: string;
  F1_REPLIES: string;
  F1_WARM: string;
  F1_BOOKED: string;
  F1_PAID: string;

  // Range 2 Personal
  P2_DMS: string;
  P2_TARGETS: string;
  P2_REPLIES: string;
  P2_WARM: string;
  P2_BOOKED: string;
  P2_PAID: string;

  // Range 2 Fleet (Global for actor handle)
  F2_DMS: string;
  F2_TARGETS: string;
  F2_REPLIES: string;
  F2_WARM: string;
  F2_BOOKED: string;
  F2_PAID: string;
}

export const getCachedActorsWithStats = cache(unstable_cache(
    async (filters: {
        operatorNames?: string[];
        statuses?: string[];
        handles?: string[];
        range1?: string;
        range2?: string;
    } = {}) => {
        try {
            const { operatorNames, statuses, handles, range1 = 'All Time', range2 = 'All Time' } = filters;
            const whereConditions: string[] = [];
            const queryParams: Record<string, string | number> = {};

            const getTimeFilter = (range: string) => {
                if (range === 'Today') return "AND el.CREATED_AT >= TRUNC(SYSDATE)";
                if (range === 'This Week') return "AND el.CREATED_AT >= TRUNC(SYSDATE, 'IW')";
                if (range === 'This Month') return "AND el.CREATED_AT >= TRUNC(SYSDATE, 'MM')";
                return ""; // All Time
            };

            const f1 = getTimeFilter(range1);
            const f2 = getTimeFilter(range2);

            if (operatorNames && operatorNames.length > 0) {
                const keys = operatorNames.map((_, i) => `:op${i}`);
                whereConditions.push(`o.OPR_NAME IN (${keys.join(', ')})`);
                operatorNames.forEach((n, i) => { queryParams[`op${i}`] = n; });
            }

            if (statuses && statuses.length > 0) {
                const keys = statuses.map((_, i) => `:st${i}`);
                whereConditions.push(`a.ACT_STATUS IN (${keys.join(', ')})`);
                statuses.forEach((s, i) => { queryParams[`st${i}`] = s; });
            }

            if (handles && handles.length > 0) {
                const keys = handles.map((_, i) => `:ha${i}`);
                whereConditions.push(`a.ACT_USERNAME IN (${keys.join(', ')})`);
                handles.forEach((h, i) => { queryParams[`ha${i}`] = h; });
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

            const query = `
                WITH p1 AS (
                    SELECT el.ACT_ID,
                        COUNT(CASE WHEN el.EVENT_TYPE = 'Outreach' THEN 1 END) as DM,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' THEN el.TAR_ID END) as TRG,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' AND t.TAR_STATUS IN ('Replied', 'Warm', 'Booked', 'Paid') THEN t.TAR_ID END) as RPL,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' AND t.TAR_STATUS IN ('Warm', 'Booked', 'Paid') THEN t.TAR_ID END) as WRM,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' AND t.TAR_STATUS IN ('Booked', 'Paid') THEN t.TAR_ID END) as BKD,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' AND t.TAR_STATUS = 'Paid' THEN t.TAR_ID END) as PAD
                    FROM EVENT_LOGS el JOIN TARGETS t ON el.TAR_ID = t.TAR_ID
                    WHERE 1=1 ${f1} GROUP BY el.ACT_ID
                ),
                g1 AS (
                    SELECT aa.ACT_USERNAME,
                        COUNT(CASE WHEN el.EVENT_TYPE = 'Outreach' THEN 1 END) as DM,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' THEN el.TAR_ID END) as TRG,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' AND t.TAR_STATUS IN ('Replied', 'Warm', 'Booked', 'Paid') THEN t.TAR_ID END) as RPL,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' AND t.TAR_STATUS IN ('Warm', 'Booked', 'Paid') THEN t.TAR_ID END) as WRM,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' AND t.TAR_STATUS IN ('Booked', 'Paid') THEN t.TAR_ID END) as BKD,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' AND t.TAR_STATUS = 'Paid' THEN t.TAR_ID END) as PAD
                    FROM EVENT_LOGS el JOIN ACTORS aa ON el.ACT_ID = aa.ACT_ID JOIN TARGETS t ON el.TAR_ID = t.TAR_ID
                    WHERE 1=1 ${f1} GROUP BY aa.ACT_USERNAME
                ),
                p2 AS (
                    SELECT el.ACT_ID,
                        COUNT(CASE WHEN el.EVENT_TYPE = 'Outreach' THEN 1 END) as DM,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' THEN el.TAR_ID END) as TRG,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' AND t.TAR_STATUS IN ('Replied', 'Warm', 'Booked', 'Paid') THEN t.TAR_ID END) as RPL,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' AND t.TAR_STATUS IN ('Warm', 'Booked', 'Paid') THEN t.TAR_ID END) as WRM,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' AND t.TAR_STATUS IN ('Booked', 'Paid') THEN t.TAR_ID END) as BKD,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' AND t.TAR_STATUS = 'Paid' THEN t.TAR_ID END) as PAD
                    FROM EVENT_LOGS el JOIN TARGETS t ON el.TAR_ID = t.TAR_ID
                    WHERE 1=1 ${f2} GROUP BY el.ACT_ID
                ),
                g2 AS (
                    SELECT aa.ACT_USERNAME,
                        COUNT(CASE WHEN el.EVENT_TYPE = 'Outreach' THEN 1 END) as DM,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' THEN el.TAR_ID END) as TRG,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' AND t.TAR_STATUS IN ('Replied', 'Warm', 'Booked', 'Paid') THEN t.TAR_ID END) as RPL,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' AND t.TAR_STATUS IN ('Warm', 'Booked', 'Paid') THEN t.TAR_ID END) as WRM,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' AND t.TAR_STATUS IN ('Booked', 'Paid') THEN t.TAR_ID END) as BKD,
                        COUNT(DISTINCT CASE WHEN el.EVENT_TYPE = 'Outreach' AND t.TAR_STATUS = 'Paid' THEN t.TAR_ID END) as PAD
                    FROM EVENT_LOGS el JOIN ACTORS aa ON el.ACT_ID = aa.ACT_ID JOIN TARGETS t ON el.TAR_ID = t.TAR_ID
                    WHERE 1=1 ${f2} GROUP BY aa.ACT_USERNAME
                )
                SELECT
                    a.ACT_ID, a.ACT_USERNAME, a.OPR_ID, o.OPR_NAME, a.ACT_STATUS,
                    TO_CHAR(NVL(p1.DM, 0)) as P1_DMS, TO_CHAR(NVL(p1.TRG, 0)) as P1_TARGETS, TO_CHAR(NVL(p1.RPL, 0)) as P1_REPLIES,
                    TO_CHAR(NVL(p1.WRM, 0)) as P1_WARM, TO_CHAR(NVL(p1.BKD, 0)) as P1_BOOKED, TO_CHAR(NVL(p1.PAD, 0)) as P1_PAID,
                    TO_CHAR(NVL(g1.DM, 0)) as F1_DMS, TO_CHAR(NVL(g1.TRG, 0)) as F1_TARGETS, TO_CHAR(NVL(g1.RPL, 0)) as F1_REPLIES,
                    TO_CHAR(NVL(g1.WRM, 0)) as F1_WARM, TO_CHAR(NVL(g1.BKD, 0)) as F1_BOOKED, TO_CHAR(NVL(g1.PAD, 0)) as F1_PAID,
                    TO_CHAR(NVL(p2.DM, 0)) as P2_DMS, TO_CHAR(NVL(p2.TRG, 0)) as P2_TARGETS, TO_CHAR(NVL(p2.RPL, 0)) as P2_REPLIES,
                    TO_CHAR(NVL(p2.WRM, 0)) as P2_WARM, TO_CHAR(NVL(p2.BKD, 0)) as P2_BOOKED, TO_CHAR(NVL(p2.PAD, 0)) as P2_PAID,
                    TO_CHAR(NVL(g2.DM, 0)) as F2_DMS, TO_CHAR(NVL(g2.TRG, 0)) as F2_TARGETS, TO_CHAR(NVL(g2.RPL, 0)) as F2_REPLIES,
                    TO_CHAR(NVL(g2.WRM, 0)) as F2_WARM, TO_CHAR(NVL(g2.BKD, 0)) as F2_BOOKED, TO_CHAR(NVL(g2.PAD, 0)) as F2_PAID
                FROM ACTORS a
                JOIN OPERATORS o ON a.OPR_ID = o.OPR_ID
                LEFT JOIN p1 ON a.ACT_ID = p1.ACT_ID
                LEFT JOIN g1 ON a.ACT_USERNAME = g1.ACT_USERNAME
                LEFT JOIN p2 ON a.ACT_ID = p2.ACT_ID
                LEFT JOIN g2 ON a.ACT_USERNAME = g2.ACT_USERNAME
                ${whereClause}
                ORDER BY a.ACT_USERNAME ASC, o.OPR_NAME ASC
            `;
            return await dbQuery<ActorWithStats>(query, queryParams);
        } catch (e) {
            console.error('Failed to fetch actors:', e);
            return [];
        }
    },
    ["actors-stats-v14"],
    { revalidate: 900, tags: ["actors", "logs"] }
));

/**
 * Detailed Operator Stats - Trend, Actor Breakdown & Lead Distribution
 */
export const getOperatorDetailedStats = cache(unstable_cache(
    async (operatorName: string) => {
        try {
            // 1. Operator Metadata
            const info = await dbQuery<OperatorBasic & { CREATED_AT: string, LAST_ACTIVITY: string }>(`
                SELECT OPR_ID, OPR_NAME, OPR_EMAIL, OPR_STATUS,
                       TO_CHAR(CREATED_AT, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as CREATED_AT,
                       TO_CHAR(LAST_ACTIVITY, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as LAST_ACTIVITY
                FROM OPERATORS 
                WHERE OPR_NAME = :name
            `, { name: operatorName });

            // 2. 14-day volume trend
            const volume = await dbQuery<{ LOG_DATE: string, TOTAL: string }>(`
                SELECT TO_CHAR(TRUNC(ol.SENT_AT), 'YYYY-MM-DD') as LOG_DATE, TO_CHAR(COUNT(*)) as TOTAL 
                FROM OUTREACH_LOGS ol
                JOIN EVENT_LOGS el ON ol.ELG_ID = el.ELG_ID
                JOIN OPERATORS o ON el.OPR_ID = o.OPR_ID
                WHERE o.OPR_NAME = :name AND ol.SENT_AT >= SYSDATE - 14
                GROUP BY TRUNC(ol.SENT_AT) 
                ORDER BY LOG_DATE ASC
            `, { name: operatorName });

            // 3. Actor Breakdown (How many DMs sent per actor account)
            const actorBreakdown = await dbQuery<{ ACT_USERNAME: string, TOTAL: string }>(`
                SELECT a.ACT_USERNAME, TO_CHAR(COUNT(*)) as TOTAL
                FROM EVENT_LOGS el
                JOIN ACTORS a ON el.ACT_ID = a.ACT_ID
                JOIN OPERATORS o ON el.OPR_ID = o.OPR_ID
                WHERE o.OPR_NAME = :name AND el.EVENT_TYPE = 'Outreach'
                GROUP BY a.ACT_USERNAME
                ORDER BY TO_NUMBER(TOTAL) DESC
            `, { name: operatorName });

            // 4. Status Distribution (Success of this operator's outreach)
            const statusDistribution = await dbQuery<{ STATUS: string, TOTAL: string }>(`
                SELECT t.TAR_STATUS as STATUS, TO_CHAR(COUNT(DISTINCT t.TAR_ID)) as TOTAL
                FROM EVENT_LOGS el
                JOIN TARGETS t ON el.TAR_ID = t.TAR_ID
                JOIN OPERATORS o ON el.OPR_ID = o.OPR_ID
                WHERE o.OPR_NAME = :name AND el.EVENT_TYPE = 'Outreach'
                GROUP BY t.TAR_STATUS
                ORDER BY TOTAL DESC
            `, { name: operatorName });

            // 5. Recent Activity
            const recentLogs = await dbQuery<OutreachLogView & { TAR_STATUS: string }>(`
                SELECT
                    t.TAR_USERNAME,
                    t.TAR_STATUS,
                    SUBSTR(ol.MESSAGE_TEXT, 1, 500) as MESSAGE_TEXT,
                    TO_CHAR(ol.SENT_AT, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as SENT_AT,
                    o.OPR_NAME,
                    a.ACT_USERNAME
                FROM OUTREACH_LOGS ol
                JOIN EVENT_LOGS el ON ol.ELG_ID = el.ELG_ID
                JOIN ACTORS a ON el.ACT_ID = a.ACT_ID
                JOIN OPERATORS o ON el.OPR_ID = o.OPR_ID
                JOIN TARGETS t ON el.TAR_ID = t.TAR_ID
                WHERE o.OPR_NAME = :name
                ORDER BY ol.SENT_AT DESC
                FETCH FIRST 10 ROWS ONLY
            `, { name: operatorName });

            const totalDms = actorBreakdown.reduce((acc, curr) => acc + Number(curr.TOTAL), 0);

            return {
                info: info[0],
                volume,
                actorBreakdown,
                statusDistribution,
                recentLogs,
                totalDms
            };
        } catch (e) {
            console.error('Failed to fetch detailed operator stats:', e);
            return null;
        }
    },
    ["operator-detailed-stats-v1"],
    { revalidate: 300, tags: ["operators", "logs"] }
));

/**
 * Detailed Actor Stats - Weekly Trend & Operator Breakdown
 */
export const getActorDetailedStats = cache(unstable_cache(
    async (actorHandle: string) => {
        try {
            // 1. Actor Metadata (Since it's shared, we get common info and first/last activity)
            const actorInfo = await dbQuery<{ 
                ACT_STATUS: string, 
                CREATED_AT: string, 
                LAST_ACTIVITY: string,
                TOTAL_SEATS: string 
            }>(`
                SELECT 
                    MAX(ACT_STATUS) as ACT_STATUS,
                    TO_CHAR(MIN(CREATED_AT), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as CREATED_AT,
                    TO_CHAR(MAX(LAST_ACTIVITY), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as LAST_ACTIVITY,
                    TO_CHAR(COUNT(*)) as TOTAL_SEATS
                FROM ACTORS 
                WHERE ACT_USERNAME = :handle
            `, { handle: actorHandle });

            // 2. 14-day volume
            const volume = await dbQuery<{ LOG_DATE: string, TOTAL: string }>(`
                SELECT TO_CHAR(TRUNC(ol.SENT_AT), 'YYYY-MM-DD') as LOG_DATE, TO_CHAR(COUNT(*)) as TOTAL 
                FROM OUTREACH_LOGS ol
                JOIN EVENT_LOGS el ON ol.ELG_ID = el.ELG_ID
                JOIN ACTORS a ON el.ACT_ID = a.ACT_ID
                WHERE a.ACT_USERNAME = :handle AND ol.SENT_AT >= SYSDATE - 14
                GROUP BY TRUNC(ol.SENT_AT) 
                ORDER BY LOG_DATE ASC
            `, { handle: actorHandle });

            // 3. Operator breakdown
            const operatorBreakdown = await dbQuery<{ OPR_NAME: string, TOTAL: string }>(`
                SELECT o.OPR_NAME, TO_CHAR(COUNT(*)) as TOTAL
                FROM EVENT_LOGS el
                JOIN ACTORS a ON el.ACT_ID = a.ACT_ID
                JOIN OPERATORS o ON el.OPR_ID = o.OPR_ID
                WHERE a.ACT_USERNAME = :handle AND el.EVENT_TYPE = 'Outreach'
                GROUP BY o.OPR_NAME
                ORDER BY TO_NUMBER(TOTAL) DESC
            `, { handle: actorHandle });

            // 4. Recent logs with Target details
            const recentLogs = await dbQuery<OutreachLogView & { TAR_STATUS: string, CONT_SOURCE: string }>(`
                SELECT
                    t.TAR_USERNAME,
                    t.TAR_STATUS,
                    t.CONT_SOURCE,
                    SUBSTR(ol.MESSAGE_TEXT, 1, 500) as MESSAGE_TEXT,
                    TO_CHAR(ol.SENT_AT, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as SENT_AT,
                    o.OPR_NAME,
                    a.ACT_USERNAME
                FROM OUTREACH_LOGS ol
                JOIN EVENT_LOGS el ON ol.ELG_ID = el.ELG_ID
                JOIN ACTORS a ON el.ACT_ID = a.ACT_ID
                JOIN OPERATORS o ON el.OPR_ID = o.OPR_ID
                JOIN TARGETS t ON el.TAR_ID = t.TAR_ID
                WHERE a.ACT_USERNAME = :handle
                ORDER BY ol.SENT_AT DESC
                FETCH FIRST 10 ROWS ONLY
            `, { handle: actorHandle });

            // 5. Event Type Distribution
            const eventDistribution = await dbQuery<{ EVENT_TYPE: string, TOTAL: string }>(`
                SELECT el.EVENT_TYPE, TO_CHAR(COUNT(*)) as TOTAL
                FROM EVENT_LOGS el
                JOIN ACTORS a ON el.ACT_ID = a.ACT_ID
                WHERE a.ACT_USERNAME = :handle
                GROUP BY el.EVENT_TYPE
                ORDER BY TOTAL DESC
            `, { handle: actorHandle });

            // Calculate total lifetime DMs
            const totalDms = operatorBreakdown.reduce((acc, curr) => acc + Number(curr.TOTAL), 0);

            return { 
                info: actorInfo[0] || {
                    ACT_STATUS: 'Active',
                    CREATED_AT: null,
                    LAST_ACTIVITY: null,
                    TOTAL_SEATS: '0'
                },
                volume, 
                operatorBreakdown, 
                recentLogs, 
                eventDistribution,
                totalDms 
            };
        } catch (e) {
            console.error('Failed to fetch detailed actor stats:', e);
            return null;
        }
    },
    ["actor-detailed-stats-v2"],
    { revalidate: 300, tags: ["actors", "logs"] }
));

export interface OutreachLogView {
  TAR_USERNAME: string;
  MESSAGE_TEXT: string;
  SENT_AT: string;
  OPR_NAME: string;
  ACT_USERNAME: string;
}

/**
 * Recent Activity
 * NOTE: MESSAGE_TEXT is truncated to prevent buffer overflow with large CLOBs
 */
export const getCachedRecentLogs = cache(unstable_cache(
    async (operatorName?: string) => {
        // Path: OUTREACH_LOGS -> EVENT_LOGS -> (ACTORS, OPERATORS, TARGETS)
        // Use SUBSTR to safely truncate MESSAGE_TEXT and prevent buffer overflow
        const query = `
            SELECT
                t.TAR_USERNAME,
                SUBSTR(ol.MESSAGE_TEXT, 1, 500) as MESSAGE_TEXT,
                TO_CHAR(ol.SENT_AT, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as SENT_AT,
                o.OPR_NAME,
                a.ACT_USERNAME
            FROM OUTREACH_LOGS ol
            JOIN EVENT_LOGS el ON ol.ELG_ID = el.ELG_ID
            JOIN ACTORS a ON el.ACT_ID = a.ACT_ID
            JOIN OPERATORS o ON el.OPR_ID = o.OPR_ID
            JOIN TARGETS t ON el.TAR_ID = t.TAR_ID
            ${operatorName ? 'WHERE o.OPR_NAME = :op' : ''}
            ORDER BY ol.SENT_AT DESC
            FETCH FIRST 10 ROWS ONLY
        `;
        return await dbQuery<OutreachLogView>(query, operatorName ? { op: operatorName } : {});
    },
    ["recent-logs-v6"],
    { revalidate: 300, tags: ["logs", "recent"] }  // 5 min cache
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
            SELECT TO_CHAR(TRUNC(SENT_AT), 'YYYY-MM-DD') as LOG_DATE, TO_CHAR(COUNT(*)) as TOTAL 
            FROM OUTREACH_LOGS 
            WHERE SENT_AT >= SYSDATE - :days
            GROUP BY TRUNC(SENT_AT) 
            ORDER BY LOG_DATE ASC
        `, { days });
        return res;
    },
    ["outreach-volume-v4"],
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
        // Sum of all messages sent by actors owned by operator
        return await dbQuery<OperatorPerformance>(`
            SELECT o.OPR_NAME as NAME, TO_CHAR(COUNT(*)) as TOTAL 
            FROM OUTREACH_LOGS ol
            JOIN EVENT_LOGS el ON ol.ELG_ID = el.ELG_ID
            JOIN OPERATORS o ON el.OPR_ID = o.OPR_ID
            WHERE ol.SENT_AT >= SYSDATE - :days
            GROUP BY o.OPR_NAME
            ORDER BY TO_NUMBER(TOTAL) DESC
        `, { days });
    },
    ["op-performance-v4"],
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
            SELECT TO_CHAR(SENT_AT, 'HH24') as HOUR, TO_CHAR(COUNT(*)) as TOTAL 
            FROM OUTREACH_LOGS 
            WHERE SENT_AT >= SYSDATE - 30
            GROUP BY TO_CHAR(SENT_AT, 'HH24')
            ORDER BY HOUR ASC
        `);
    },
    ["activity-heatmap-v4"],
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
                TO_CHAR(COUNT(CASE WHEN EMAIL != 'N/S' AND EMAIL != 'N/F' THEN 1 END)) as WITH_EMAIL,
                TO_CHAR(COUNT(CASE WHEN PHONE_NUM != 'N/S' AND PHONE_NUM != 'N/F' THEN 1 END)) as WITH_PHONE
            FROM TARGETS
            WHERE LAST_UPDATED >= SYSDATE - :days
        `, { days });
        return res[0];
    },
    ["enrichment-v4"],
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
    // To filter by operator, we need to find targets linked to that operator's events or actors
    // Since TARGETS are shared, "My Targets" is ambiguous. 
    // Interpretation: Targets that *this operator* (via their actors) has interacted with.
    
    let joinClause = "";
    const params: Record<string, string | number> = {};

    if (operatorName) {
        joinClause = `
            JOIN (
                SELECT DISTINCT TAR_ID 
                FROM EVENT_LOGS el 
                JOIN OPERATORS o ON el.OPR_ID = o.OPR_ID 
                WHERE o.OPR_NAME = :op AND el.EVENT_TYPE = 'Outreach'
            ) my_tars ON t.TAR_ID = my_tars.TAR_ID
        `;
        params.op = operatorName;
    }

    const query = `
        SELECT t.TAR_STATUS as STATUS, TO_CHAR(COUNT(*)) as COUNT 
        FROM TARGETS t
        ${joinClause}
        GROUP BY t.TAR_STATUS 
        ORDER BY TO_NUMBER(COUNT) DESC
    `;
    return await dbQuery<StatusDistributionData>(query, params);
  },
  ["status-dist-v5"],
  { revalidate: 900, tags: ["prospects", "metrics"] }  // 15 min cache
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
        SELECT a.ACT_USERNAME as ACTOR_USERNAME, TO_CHAR(COUNT(*)) as COUNT 
        FROM OUTREACH_LOGS ol
        JOIN EVENT_LOGS el ON ol.ELG_ID = el.ELG_ID
        JOIN ACTORS a ON el.ACT_ID = a.ACT_ID
        GROUP BY a.ACT_USERNAME 
        ORDER BY TO_NUMBER(COUNT) DESC 
        FETCH FIRST 5 ROWS ONLY
    `);
  },
  ["top-actors-v6"],
  { revalidate: 900, tags: ["logs", "actors"] }  // 15 min cache
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
                TO_CHAR((
                    SELECT COUNT(*) FROM OUTREACH_LOGS ol
                    JOIN EVENT_LOGS el ON ol.ELG_ID = el.ELG_ID
                    JOIN OPERATORS o ON el.OPR_ID = o.OPR_ID
                    WHERE o.OPR_NAME = :op AND ol.SENT_AT >= SYSDATE - 1
                )) as MY_LOGS_24H,
                TO_CHAR((
                    SELECT COUNT(*) FROM OUTREACH_LOGS WHERE SENT_AT >= SYSDATE - 1
                )) as TEAM_LOGS_24H,
                TO_CHAR((SELECT COUNT(*) FROM OPERATORS WHERE OPR_STATUS = 'online')) as ACTIVE_OPERATORS
            FROM DUAL
        `, { op: operatorName });
        
        return res[0] || { MY_LOGS_24H: '0', TEAM_LOGS_24H: '0', ACTIVE_OPERATORS: '0' };
    },
    ["op-personal-v6"],
    { revalidate: 600, tags: ["logs", "metrics"] }  // 10 min cache
));

export interface PagedResult<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  }
}

export interface OutreachLogView {
  TAR_USERNAME: string;
  MESSAGE_TEXT: string;
  SENT_AT: string;
  OPR_NAME: string;
  ACT_USERNAME: string;
  EVENT_TYPE: string;
  DETAILS: string;
}

/**
 * Paginated Logs - Comprehensive activity stream from EVENT_LOGS
 */
export const getPagedLogs = async (
  page: number = 1,
  pageSize: number = 20,
  filters: {
    operatorNames?: string[];
    actorUsernames?: string[];
    eventTypes?: string[];
    query?: string;
    timeRange?: string;
  } = {}
): Promise<PagedResult<OutreachLogView>> => {
    const { operatorNames, actorUsernames, eventTypes, query, timeRange = 'All Time' } = filters;
    const whereConditions: string[] = [];
    const queryParams: Record<string, string | number> = {};

    if (query) {
        whereConditions.push("(LOWER(t.TAR_USERNAME) LIKE :q OR LOWER(ol.MESSAGE_TEXT) LIKE :q OR LOWER(el.DETAILS) LIKE :q)");
        queryParams.q = `%${query.toLowerCase()}%`;
    }

    if (timeRange === 'Today') {
        whereConditions.push("el.CREATED_AT >= TRUNC(SYSDATE)");
    } else if (timeRange === 'This Week') {
        whereConditions.push("el.CREATED_AT >= TRUNC(SYSDATE, 'IW')");
    } else if (timeRange === 'This Month') {
        whereConditions.push("el.CREATED_AT >= TRUNC(SYSDATE, 'MM')");
    }

    if (operatorNames && operatorNames.length > 0) {
        const keys = operatorNames.map((_, i) => `:op${i}`);
        whereConditions.push(`o.OPR_NAME IN (${keys.join(', ')})`);
        operatorNames.forEach((n, i) => { queryParams[`op${i}`] = n; });
    }

    if (actorUsernames && actorUsernames.length > 0) {
        const keys = actorUsernames.map((_, i) => `:act${i}`);
        whereConditions.push(`a.ACT_USERNAME IN (${keys.join(', ')})`);
        actorUsernames.forEach((n, i) => { queryParams[`act${i}`] = n; });
    }

    if (eventTypes && eventTypes.length > 0) {
        const keys = eventTypes.map((_, i) => `:et${i}`);
        whereConditions.push(`el.EVENT_TYPE IN (${keys.join(', ')})`);
        eventTypes.forEach((et, i) => { queryParams[`et${i}`] = et; });
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";
    const offset = (page - 1) * pageSize;

    const sql = `
        SELECT
            t.TAR_USERNAME as "TAR_USERNAME",
            SUBSTR(ol.MESSAGE_TEXT, 1, 500) as "MESSAGE_TEXT",
            TO_CHAR(COALESCE(ol.SENT_AT, el.CREATED_AT), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "SENT_AT",
            o.OPR_NAME as "OPR_NAME",
            a.ACT_USERNAME as "ACT_USERNAME",
            el.EVENT_TYPE as "EVENT_TYPE",
            SUBSTR(el.DETAILS, 1, 500) as "DETAILS",
            TO_CHAR(COUNT(*) OVER()) as "total_count"
        FROM EVENT_LOGS el
        LEFT JOIN OUTREACH_LOGS ol ON el.ELG_ID = ol.ELG_ID
        JOIN ACTORS a ON el.ACT_ID = a.ACT_ID
        JOIN OPERATORS o ON el.OPR_ID = o.OPR_ID
        JOIN TARGETS t ON el.TAR_ID = t.TAR_ID
        ${whereClause}
        ORDER BY COALESCE(ol.SENT_AT, el.CREATED_AT) DESC
        OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    const data = await dbQuery<OutreachLogView & { total_count: string }>(sql, { ...queryParams, offset, limit: pageSize });
    const total = data[0]?.total_count ? parseInt(data[0].total_count, 10) : 0;

    // Remove total_count from each row
    const cleanData = data.map(({ total_count: _, ...rest }) => rest);

    return {
        data: cleanData,
        metadata: {
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize) || 1
        }
    };
};

export interface LeadView {
    target_username: string;
    status: string;
    last_updated: string;
    email: string;
    phone_number: string;
    source_summary: string;
    notes: string;
    actors_list: string | null;
}

/**
 * Paginated Leads (Targets) - SINGLE QUERY with COUNT(*) OVER()
 */
export const getPagedLeads = async (
    page: number = 1,
    pageSize: number = 20,
    filters: {
        query?: string;
        statuses?: string[];
        operators?: string[];
        actors?: string[];
        timeRange?: string;
    }
): Promise<PagedResult<LeadView>> => {
    const { query, statuses, operators, actors, timeRange = 'All Time' } = filters;
    const whereConditions: string[] = [];
    const queryParams: Record<string, string | number> = {};

    if (query) {
        whereConditions.push("LOWER(t.TAR_USERNAME) LIKE :q");
        queryParams.q = `%${query.toLowerCase()}%`;
    }

    if (timeRange === 'Today') {
        whereConditions.push("t.LAST_UPDATED >= TRUNC(SYSDATE)");
    } else if (timeRange === 'This Week') {
        whereConditions.push("t.LAST_UPDATED >= TRUNC(SYSDATE, 'IW')");
    } else if (timeRange === 'This Month') {
        whereConditions.push("t.LAST_UPDATED >= TRUNC(SYSDATE, 'MM')");
    }

    if (statuses && statuses.length > 0) {
        // Oracle doesn't support binding arrays directly in IN clauses easily without types.
        // We'll use dynamic SQL for the IN clause with individual bind variables.
        const statusKeys = statuses.map((_, i) => `:s${i}`);
        whereConditions.push(`t.TAR_STATUS IN (${statusKeys.join(', ')})`);
        statuses.forEach((s, i) => { queryParams[`s${i}`] = s; });
    }

    let fromClause = "FROM TARGETS t";

    // Filtering by Operators or Actors requires joining with EVENT_LOGS/ACTORS/OPERATORS
    if ((operators && operators.length > 0) || (actors && actors.length > 0)) {
        fromClause += `
            JOIN (
                SELECT DISTINCT el.TAR_ID
                FROM EVENT_LOGS el
                JOIN OPERATORS o ON el.OPR_ID = o.OPR_ID
                JOIN ACTORS a ON el.ACT_ID = a.ACT_ID
                WHERE 1=1
        `;
        
        const subqueryConditions: string[] = [];
        
        if (operators && operators.length > 0) {
             const opKeys = operators.map((_, i) => `:op${i}`);
             subqueryConditions.push(`o.OPR_NAME IN (${opKeys.join(', ')})`);
             operators.forEach((o, i) => { queryParams[`op${i}`] = o; });
        }
        
        if (actors && actors.length > 0) {
             const actKeys = actors.map((_, i) => `:act${i}`);
             subqueryConditions.push(`a.ACT_USERNAME IN (${actKeys.join(', ')})`);
             actors.forEach((a, i) => { queryParams[`act${i}`] = a; });
        }
        
        if (subqueryConditions.length > 0) {
            fromClause += ` AND (${subqueryConditions.join(' OR ')})`;
        }
        
        fromClause += ` ) my_interactions ON t.TAR_ID = my_interactions.TAR_ID`;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";
    const offset = (page - 1) * pageSize;

    // Single query with COUNT(*) OVER() for total
    const sql = `
        SELECT
            t.TAR_USERNAME as "target_username",
            t.TAR_STATUS as "status",
            TO_CHAR(t.LAST_UPDATED, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "last_updated",
            t.EMAIL as "email",
            t.PHONE_NUM as "phone_number",
            SUBSTR(t.CONT_SOURCE, 1, 500) as "source_summary",
            SUBSTR(t.NOTES, 1, 2000) as "notes",
            (
                SELECT LISTAGG(aa.ACT_USERNAME, ', ') WITHIN GROUP (ORDER BY aa.ACT_USERNAME)
                FROM (SELECT DISTINCT el.ACT_ID, el.TAR_ID FROM EVENT_LOGS el WHERE el.EVENT_TYPE = 'Outreach') sub
                JOIN ACTORS aa ON sub.ACT_ID = aa.ACT_ID
                WHERE sub.TAR_ID = t.TAR_ID
            ) as "actors_list",
            TO_CHAR(COUNT(*) OVER()) as "total_count"
        ${fromClause}
        ${whereClause}
        ORDER BY t.LAST_UPDATED DESC
        OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    const data = await dbQuery<LeadView & { total_count: string }>(sql, { ...queryParams, offset, limit: pageSize });
    const total = data[0]?.total_count ? parseInt(data[0].total_count, 10) : 0;

    // Remove total_count from each row
    const cleanData = data.map(({ total_count: _, ...rest }) => rest);

    return {
        data: cleanData,
        metadata: {
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize) || 1
        }
    };
};