declare module 'oracledb' {
  // Output formats
  export const OUT_FORMAT_OBJECT: number;
  export const OUT_FORMAT_ARRAY: number;

  // Data types for fetchAsString
  export const NUMBER: number;
  export const DATE: number;
  export const TIMESTAMP: number;
  export const CLOB: number;
  export const BLOB: number;

  // DB Type constants (for fetchAsString with LOBs)
  export const DB_TYPE_CLOB: number;
  export const DB_TYPE_BLOB: number;
  export const DB_TYPE_NCLOB: number;
  export const DB_TYPE_VARCHAR: number;
  export const DB_TYPE_NUMBER: number;
  export const DB_TYPE_DATE: number;
  export const DB_TYPE_TIMESTAMP: number;
  export const DB_TYPE_TIMESTAMP_TZ: number;
  export const DB_TYPE_TIMESTAMP_LTZ: number;

  // Global settings
  export let outFormat: number;
  export let fetchAsString: number[];
  export let autoCommit: boolean;
  export let stmtCacheSize: number;

  export interface BindParameters {
    [key: string]: string | number | boolean | null | undefined | Date | Buffer;
  }

  export interface ExecuteOptions {
    outFormat?: number;
    fetchArraySize?: number;
    prefetchRows?: number;
    maxRows?: number;
    autoCommit?: boolean;
  }

  export interface Result<T> {
    rows?: T[];
    rowsAffected?: number;
    metaData?: Array<{ name: string; dbType: number }>;
  }

  export interface Connection {
    execute<T = Record<string, unknown>>(
      sql: string,
      params?: BindParameters,
      options?: ExecuteOptions
    ): Promise<Result<T>>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    close(): Promise<void>;
    ping(): Promise<void>;
  }

  export interface Pool {
    getConnection(): Promise<Connection>;
    close(drainTime?: number): Promise<void>;
    reconfigure(options: Partial<PoolAttributes>): Promise<void>;
    readonly connectionsOpen: number;
    readonly connectionsInUse: number;
  }

  export interface PoolAttributes {
    user?: string;
    password?: string;
    connectString?: string;
    poolMin?: number;
    poolMax?: number;
    poolIncrement?: number;
    poolTimeout?: number;
    poolPingInterval?: number;
    poolPingTimeout?: number;
    queueMax?: number;
    queueTimeout?: number;
    stmtCacheSize?: number;
  }

  export function createPool(attrs: PoolAttributes): Promise<Pool>;
  export function getConnection(attrs: PoolAttributes): Promise<Connection>;
}
