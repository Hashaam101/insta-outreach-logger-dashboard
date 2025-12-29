import oracledb from 'oracledb';
import { env } from './env';

/**
 * ORACLE DATABASE LAYER - Direct Connection Mode (Stability Focus)
 *
 * Switching to connection-per-query pattern to resolve 
 * 'Attempt to access memory outside buffer bounds' seen with pooling
 * in some Oracle ATP / Thin driver environments.
 */

// Configure oracledb for maximum stability
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;
oracledb.fetchAsString = [oracledb.CLOB]; // Only fetch CLOB as string, handle others manually
oracledb.stmtCacheSize = 0;
oracledb.fetchArraySize = 50;

const getConnectionConfig = () => ({
  user: env.ORACLE_USER,
  password: env.ORACLE_PASSWORD,
  connectString: (env.ORACLE_CONN_STRING || '').replace(/\s+/g, ''),
});

// Simple in-memory cache
const queryCache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Execute a query with a fresh connection every time
 */
export async function dbQuery<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, unknown> = {},
  options: { maxRetries?: number; useCache?: boolean; cacheKey?: string } = {}
): Promise<T[]> {
  const { maxRetries = 5, useCache = false, cacheKey } = options;

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
      // Get a fresh connection
      conn = await oracledb.getConnection(getConnectionConfig());

      const result = await conn.execute<T>(sql, params, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchArraySize: 50,
        maxRows: 1000,
      });

      // Always close immediately
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
        err.code === 'ORA-00018' ||
        err.code?.startsWith('NJS-') ||
        err.message?.includes('buffer') ||
        err.message?.includes('memory') ||
        err.message?.includes('ORA-');

      if (isRetryable && attempt < maxRetries - 1) {
        console.warn(`⚠️ DB Retry ${attempt + 1}/${maxRetries} (${err.code || 'Error'})`);
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
  const rows = await dbQuery<T>(sql, params, { maxRetries: 5 });
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
  const rows = await dbQuery<T>(sql, params, { useCache: true, cacheKey, maxRetries: 5 });
  return rows[0] || null;
}