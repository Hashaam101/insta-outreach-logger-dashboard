import oracledb from 'oracledb';
import { env } from './env';

/**
 * ORACLE DATABASE LAYER - Optimized for Stability & Session Management
 *
 * Key changes:
 * - Global Singleton Pattern (prevents multiple pools during hot-reloads)
 * - Conservative Pooling (reduced max sessions)
 * - Strict Connection Lifecycle
 */

// Configure oracledb for Thin mode stability
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;
oracledb.fetchAsString = [oracledb.NUMBER, oracledb.DATE, oracledb.CLOB];
oracledb.stmtCacheSize = 0;

// Singleton pattern for Next.js dev mode
const globalForDb = global as unknown as { pool: oracledb.Pool | undefined };

async function getPool(): Promise<oracledb.Pool> {
  if (globalForDb.pool) return globalForDb.pool;

  try {
    const newPool = await oracledb.createPool({
      user: env.ORACLE_USER,
      password: env.ORACLE_PASSWORD,
      connectString: (env.ORACLE_CONN_STRING || '').replace(/\s+/g, ''),
      poolMin: 1,
      poolMax: 4,      // Significantly reduced to prevent ORA-00018
      poolIncrement: 1,
      poolTimeout: 30, // Close idle connections faster (30s)
      queueMax: 50,    // Allow more queries to wait rather than opening new sessions
    });
    
    console.log('✅ Oracle DB Pool Initialized (Global Singleton)');
    globalForDb.pool = newPool;
    return newPool;
  } catch (err) {
    console.error('❌ Failed to create DB pool:', err);
    throw err;
  }
}

// Simple in-memory cache for query results
const queryCache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Execute a query using the connection pool
 */
export async function dbQuery<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, unknown> = {},
  options: { maxRetries?: number; useCache?: boolean; cacheKey?: string } = {}
): Promise<T[]> {
  const { maxRetries = 3, useCache = false, cacheKey } = options;

  // Check cache first
  if (useCache && cacheKey) {
    const cached = queryCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.data as T[];
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    let conn: oracledb.Connection | undefined;

    try {
      const dbPool = await getPool();
      conn = await dbPool.getConnection();

      const result = await conn.execute<T>(sql, params, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchArraySize: 50,
        maxRows: 1000,
      });

      // Close connection immediately to return to pool
      await conn.close();
      conn = undefined;

      const rows = result.rows || [];
      const sanitized = rows.map(row => sanitizeRow(row as Record<string, unknown>)) as T[];

      if (useCache && cacheKey) {
        queryCache.set(cacheKey, { data: sanitized, expires: Date.now() + CACHE_TTL });
      }

      return sanitized;
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      lastError = err as Error;

      if (conn) {
        try { await conn.close(); } catch {}
      }

      const isRetryable =
        err.code === 'ERR_BUFFER_OUT_OF_BOUNDS' ||
        err.code === 'ORA-00018' || // Retry session limits
        err.code?.startsWith('NJS-') ||
        err.message?.includes('buffer') ||
        err.message?.includes('ORA-');

      if (isRetryable && attempt < maxRetries - 1) {
        // Backoff: 1s, 2s, 4s
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
        continue;
      }

      console.error('❌ DB Error:', err.message);
      throw err;
    }
  }

  throw lastError || new Error('Query failed');
}

/**
 * Sanitize row data
 */
function sanitizeRow(row: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined) {
      sanitized[key] = null;
    } else if (value instanceof Date) {
      sanitized[key] = value.toISOString();
    } else if (Buffer.isBuffer(value)) {
      sanitized[key] = value.toString('utf8');
    } else if (typeof value === 'object') {
      try {
        sanitized[key] = JSON.stringify(value);
      } catch {
        sanitized[key] = String(value);
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Execute query and return single row
 */
export async function dbQuerySingle<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, unknown> = {}
): Promise<T | null> {
  const rows = await dbQuery<T>(sql, params);
  return rows[0] || null;
}

/**
 * Execute count query
 */
export async function dbCount(
  sql: string,
  params: Record<string, unknown> = {}
): Promise<number> {
  const result = await dbQuerySingle<{ CNT: string | number }>(sql, params);
  const val = result?.CNT;
  if (val === null || val === undefined) return 0;
  return typeof val === 'number' ? val : parseInt(String(val), 10) || 0;
}

/**
 * Clear query cache
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

/**
 * Execute query and return single row (Cached)
 */
export async function dbQuerySingleCached<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, unknown>,
  cacheKey: string
): Promise<T | null> {
  const rows = await dbQuery<T>(sql, params, { useCache: true, cacheKey });
  return rows[0] || null;
}
