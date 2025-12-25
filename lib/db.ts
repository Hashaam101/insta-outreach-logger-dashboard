import oracledb from 'oracledb';
import type { Pool, Connection } from 'oracledb';
import { env } from './env';
import { LRUCache } from 'lru-cache';

// oracledb 6.x uses Thin mode by default (pure JS, no Oracle Client needed)
// Configure for stability
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
(oracledb as any).autoCommit = true;

// In-memory cache (5 min TTL)
const queryCache = new LRUCache<string, any>({
  max: 200,
  ttl: 1000 * 60 * 5,
});

let pool: Pool | null = null;
let poolCreating: Promise<Pool> | null = null;

async function getPool(): Promise<Pool> {
  if (pool) return pool;

  // Prevent multiple simultaneous pool creations
  if (poolCreating) return poolCreating;

  poolCreating = (async () => {
    // Clean up connection string (remove newlines/extra spaces)
    const connStr = (env.ORACLE_CONN_STRING || '').replace(/\s+/g, '');

    console.log('🔌 Connecting to Oracle...');
    console.log('   User:', env.ORACLE_USER);
    console.log('   ConnStr length:', connStr.length);

    pool = await oracledb.createPool({
      user: env.ORACLE_USER,
      password: env.ORACLE_PASSWORD,
      connectString: connStr,
      poolMin: 1,
      poolMax: 4,
      poolIncrement: 1,
      poolTimeout: 60,
    });
    console.log('✅ Oracle Pool Created');
    return pool;
  })();

  return poolCreating;
}

/**
 * Execute SQL query with automatic retry on buffer errors
 */
export async function dbQuery<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, any> = {},
  retries = 2
): Promise<T[]> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    let conn: Connection | undefined;

    try {
      const dbPool = await getPool();
      conn = await dbPool.getConnection();

      // Very conservative settings to avoid buffer issues in Thin mode
      const result = await conn.execute(sql, params, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchArraySize: 100, // Increased for stability
        prefetchRows: 0,    // MUST BE 0 to avoid many internal buffer pre-allocation bugs
      });

      return (result.rows || []) as T[];
    } catch (error: any) {
      lastError = error;

      // On buffer error, close connection and retry
      if (error.code === 'ERR_BUFFER_OUT_OF_BOUNDS') {
        console.warn(`⚠️ Buffer error on attempt ${attempt + 1}, retrying...`);
        if (conn) {
          try { await conn.close(); conn = undefined; } catch {}
        }
        await new Promise(r => setTimeout(r, 50 * (attempt + 1)));
        continue;
      }

      console.error('❌ DB Error:', error.message);
      throw error;
    } finally {
      if (conn) {
        try { await conn.close(); } catch {}
      }
    }
  }

  throw lastError || new Error('Query failed');
}

/**
 * Cached query - checks LRU cache first
 */
export async function dbQueryCached<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, any> = {},
  cacheKey?: string
): Promise<T[]> {
  const key = cacheKey || `q:${sql}:${JSON.stringify(params)}`;

  const cached = queryCache.get(key);
  if (cached !== undefined) return cached as T[];

  try {
    const result = await dbQuery<T>(sql, params);
    queryCache.set(key, result);
    return result;
  } catch (error) {
    // Return empty array on error for cached queries
    console.error('Query failed, returning empty:', error);
    return [];
  }
}

/**
 * Get single row
 */
export async function dbQuerySingle<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, any> = {}
): Promise<T | null> {
  const rows = await dbQuery<T>(sql, params);
  return rows[0] || null;
}

/**
 * Get single row with caching
 */
export async function dbQuerySingleCached<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, any> = {},
  cacheKey?: string
): Promise<T | null> {
  const rows = await dbQueryCached<T>(sql, params, cacheKey);
  return rows[0] || null;
}

/**
 * Count query - returns number
 */
export async function dbCount(
  sql: string,
  params: Record<string, any> = {}
): Promise<number> {
  const result = await dbQuerySingle<{ CNT: any }>(sql, params);
  const val = result?.CNT;
  if (val === null || val === undefined) return 0;
  return typeof val === 'number' ? val : parseInt(String(val), 10) || 0;
}

/**
 * Cached count - returns 0 on error
 */
export async function dbCountCached(
  sql: string,
  params: Record<string, any> = {},
  cacheKey?: string
): Promise<number> {
  const key = cacheKey || `c:${sql}:${JSON.stringify(params)}`;

  const cached = queryCache.get(key);
  if (cached !== undefined) return cached as number;

  try {
    const count = await dbCount(sql, params);
    queryCache.set(key, count);
    return count;
  } catch {
    return 0;
  }
}

/**
 * Clear all cache
 */
export function clearCache() {
  queryCache.clear();
}

/**
 * Invalidate cache entries matching pattern
 */
export function invalidateCache(pattern: string) {
  for (const key of queryCache.keys()) {
    if (key.includes(pattern)) {
      queryCache.delete(key);
    }
  }
}

export default getPool;
