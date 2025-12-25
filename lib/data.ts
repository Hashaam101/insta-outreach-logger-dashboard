import { dbQuery } from "./db";
import { unstable_cache } from "next/cache";

/**
 * Outreach Volume with variable days
 */
export const getCachedOutreachVolume = unstable_cache(
    async (days: number = 14) => {
        return await dbQuery(`
            SELECT TO_CHAR(TRUNC(CREATED_AT), 'YYYY-MM-DD') as LOG_DATE, COUNT(*) as TOTAL 
            FROM OUTREACH_LOGS 
            WHERE CREATED_AT >= SYSDATE - :days
            GROUP BY TRUNC(CREATED_AT) 
            ORDER BY LOG_DATE ASC
        `, { days });
    },
    ["outreach-volume-dynamic"],
    { revalidate: 3600, tags: ["logs"] }
);

/**
 * Operator Performance with variable days
 */
export const getCachedOperatorPerformance = unstable_cache(
    async (days: number = 30) => {
        return await dbQuery(`
            SELECT a.OWNER_OPERATOR as NAME, COUNT(*) as TOTAL 
            FROM OUTREACH_LOGS l
            JOIN ACTORS a ON l.ACTOR_USERNAME = a.USERNAME
            WHERE l.CREATED_AT >= SYSDATE - :days
            GROUP BY a.OWNER_OPERATOR
            ORDER BY TOTAL DESC
        `, { days });
    },
    ["operator-performance-dynamic"],
    { revalidate: 3600, tags: ["logs", "actors"] }
);

/**
 * Peak Activity Heatmap (Hourly)
 */
export const getCachedActivityHeatmap = unstable_cache(
    async () => {
        return await dbQuery(`
            SELECT TO_CHAR(CREATED_AT, 'HH24') as HOUR, COUNT(*) as TOTAL 
            FROM OUTREACH_LOGS 
            WHERE CREATED_AT >= SYSDATE - 30
            GROUP BY TO_CHAR(CREATED_AT, 'HH24')
            ORDER BY HOUR ASC
        `);
    },
    ["activity-heatmap"],
    { revalidate: 3600, tags: ["logs"] }
);

/**
 * KPI Stats
 */
export const getCachedStats = unstable_cache(
  async () => {
    const results = await dbQuery(`
      SELECT 
        (SELECT COUNT(*) FROM PROSPECTS) as PROSPECTS_TOTAL,
        (SELECT COUNT(*) FROM OUTREACH_LOGS) as LOGS_TOTAL,
        (SELECT COUNT(*) FROM ACTORS) as ACTORS_TOTAL,
        (SELECT COUNT(*) FROM OPERATORS) as OPERATORS_TOTAL,
        (SELECT COUNT(*) FROM OUTREACH_LOGS WHERE CREATED_AT >= SYSDATE - 1) as LOGS_24H
      FROM DUAL
    `);
    return results[0];
  },
  ["dashboard-stats-v2"],
  { revalidate: 60, tags: ["stats"] }
);

// Enrichment Health
export const getCachedEnrichmentStats = unstable_cache(
    async () => {
        const res = await dbQuery(`
            SELECT 
                COUNT(*) as TOTAL,
                COUNT(EMAIL) as WITH_EMAIL,
                COUNT(PHONE_NUMBER) as WITH_PHONE
            FROM PROSPECTS
        `);
        return res[0];
    },
    ["enrichment-stats"],
    { revalidate: 3600, tags: ["prospects"] }
);

// Status Distribution
export const getCachedStatusDistribution = unstable_cache(
  async () => {
    return await dbQuery(`
        SELECT status, COUNT(*) as COUNT 
        FROM PROSPECTS 
        GROUP BY status 
        ORDER BY COUNT DESC
    `);
  },
  ["status-distribution"],
  { revalidate: 300, tags: ["prospects"] }
);

// Top Actors
export const getCachedTopActors = unstable_cache(
  async () => {
    return await dbQuery(`
        SELECT actor_username, COUNT(*) as COUNT 
        FROM OUTREACH_LOGS 
        GROUP BY actor_username 
        ORDER BY COUNT DESC 
        FETCH FIRST 5 ROWS ONLY
    `);
  },
  ["top-actors"],
  { revalidate: 300, tags: ["logs", "actors"] }
);
