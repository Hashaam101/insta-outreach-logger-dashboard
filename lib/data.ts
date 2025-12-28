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
        
        const logFilter = operatorName 
            ? `JOIN ACTORS a ON l.ACT_ID = a.ACT_ID JOIN OPERATORS o ON a.OPR_ID = o.OPR_ID WHERE o.OPR_NAME = :op`
            : ``;
        
        // For Targets (Prospects), we count distinct TARGETS contacted by this Operator's Actors
        const targetJoin = operatorName
            ? `JOIN EVENT_LOGS e ON t.TAR_ID = e.TAR_ID JOIN OPERATORS o ON e.OPR_ID = o.OPR_ID WHERE o.OPR_NAME = :op`
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
}

/**
 * Get all operators (for dropdowns, etc.)
 * Cached to reduce DB calls
 */
export const getCachedOperators = cache(unstable_cache(
    async () => {
        return await dbQuery<OperatorBasic>(`
            SELECT OPR_ID, OPR_NAME
            FROM OPERATORS
            ORDER BY OPR_NAME ASC
        `);
    },
    ["operators-list-v1"],
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
  TOTAL_DMS: string;
  TOTAL_BOOKED: string;
}

/**
 * Actor Performance - SINGLE QUERY VERSION
 * Fetches actors with stats in ONE query to avoid multiple DB round-trips
 */
export const getCachedActorsWithStats = cache(unstable_cache(
    async (operatorName?: string) => {
        try {
            // Single query with all data - no separate stats queries
            const query = `
                SELECT
                    a.ACT_ID,
                    a.ACT_USERNAME,
                    a.OPR_ID,
                    o.OPR_NAME,
                    a.ACT_STATUS,
                    TO_CHAR(NVL(stats.DM_COUNT, 0)) as TOTAL_DMS,
                    '0' as TOTAL_BOOKED
                FROM ACTORS a
                JOIN OPERATORS o ON a.OPR_ID = o.OPR_ID
                LEFT JOIN (
                    SELECT ACT_ID, COUNT(*) as DM_COUNT
                    FROM EVENT_LOGS
                    WHERE EVENT_TYPE = 'Outreach'
                    GROUP BY ACT_ID
                ) stats ON a.ACT_ID = stats.ACT_ID
                ${operatorName ? 'WHERE o.OPR_NAME = :op' : ''}
                ORDER BY NVL(stats.DM_COUNT, 0) DESC
            `;
            return await dbQuery<ActorWithStats>(query, operatorName ? { op: operatorName } : {});
        } catch (e) {
            console.error('Failed to fetch actors:', e);
            return [];
        }
    },
    ["actors-stats-v9"],
    { revalidate: 900, tags: ["actors", "logs"] }
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
                TO_CHAR(ol.SENT_AT, 'YYYY-MM-DD HH24:MI:SS') as SENT_AT,
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
    let whereClause = "";
    const params: any = {};

    if (operatorName) {
        joinClause = `
            JOIN (
                SELECT DISTINCT TAR_ID 
                FROM EVENT_LOGS el 
                JOIN OPERATORS o ON el.OPR_ID = o.OPR_ID 
                WHERE o.OPR_NAME = :op
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

/**
 * Paginated Logs - SINGLE QUERY with COUNT(*) OVER()
 */
export const getPagedLogs = async (
  page: number = 1,
  pageSize: number = 20,
  filters: {
    operatorName?: string;
    actorUsername?: string;
  } = {}
): Promise<PagedResult<any>> => {
    const { operatorName, actorUsername } = filters;
    const whereConditions: string[] = [];
    const queryParams: Record<string, any> = {};

    if (operatorName) {
        whereConditions.push("o.OPR_NAME = :op");
        queryParams.op = operatorName;
    }

    if (actorUsername) {
        whereConditions.push("a.ACT_USERNAME = :actor");
        queryParams.actor = actorUsername;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";
    const offset = (page - 1) * pageSize;

    // Single query with COUNT(*) OVER() for total
    const sql = `
        SELECT
            t.TAR_USERNAME as "target_username",
            SUBSTR(ol.MESSAGE_TEXT, 1, 500) as "message_text",
            TO_CHAR(ol.SENT_AT, 'YYYY-MM-DD HH24:MI:SS') as "created_at",
            o.OPR_NAME as "operator_name",
            a.ACT_USERNAME as "actor_username",
            TO_CHAR(COUNT(*) OVER()) as "total_count"
        FROM OUTREACH_LOGS ol
        JOIN EVENT_LOGS el ON ol.ELG_ID = el.ELG_ID
        JOIN ACTORS a ON el.ACT_ID = a.ACT_ID
        JOIN OPERATORS o ON el.OPR_ID = o.OPR_ID
        JOIN TARGETS t ON el.TAR_ID = t.TAR_ID
        ${whereClause}
        ORDER BY ol.SENT_AT DESC
        OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    const data = await dbQuery<any>(sql, { ...queryParams, offset, limit: pageSize });
    const total = data[0]?.total_count ? parseInt(data[0].total_count, 10) : 0;

    // Remove total_count from each row
    const cleanData = data.map(({ total_count, ...rest }) => rest);

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
    }
): Promise<PagedResult<any>> => {
    const { query, statuses, operators, actors } = filters;
    const whereConditions: string[] = [];
    const queryParams: Record<string, any> = {};

    if (query) {
        whereConditions.push("LOWER(t.TAR_USERNAME) LIKE :q");
        queryParams.q = `%${query.toLowerCase()}%`;
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
    // Logic: Targets touched by ANY of the selected operators OR actors.
    // If both are present, it's usually an OR or AND?
    // Let's assume strict filtering: If operators are selected, show targets touched by them.
    // If actors selected, show targets touched by them.
    // If both, we can join based on the union of logic or just use one join block with dynamic WHERE.

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
            TO_CHAR(t.LAST_UPDATED, 'YYYY-MM-DD HH24:MI:SS') as "last_updated",
            t.EMAIL as "email",
            t.PHONE_NUM as "phone_number",
            SUBSTR(t.CONT_SOURCE, 1, 500) as "source_summary",
            SUBSTR(t.NOTES, 1, 2000) as "notes",
            TO_CHAR(COUNT(*) OVER()) as "total_count"
        ${fromClause}
        ${whereClause}
        ORDER BY t.LAST_UPDATED DESC
        OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    const data = await dbQuery<any>(sql, { ...queryParams, offset, limit: pageSize });
    const total = data[0]?.total_count ? parseInt(data[0].total_count, 10) : 0;

    // Remove total_count from each row
    const cleanData = data.map(({ total_count, ...rest }) => rest);

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