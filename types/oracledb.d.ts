declare module 'oracledb' {
  export const OUT_FORMAT_OBJECT: number;
  export const NUMBER: number;
  export const DATE: number;
  export const TIMESTAMP: number;
  export let outFormat: number;
  export let fetchAsString: number[];
  export let autoCommit: boolean;

  export interface BindParameters {
    [key: string]: string | number | boolean | null | undefined;
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
  }

  export interface Connection {
    execute<T = Record<string, unknown>>(
      sql: string,
      params?: BindParameters,
      options?: ExecuteOptions
    ): Promise<Result<T>>;
    commit(): Promise<void>;
    close(): Promise<void>;
  }

  export interface Pool {
    getConnection(): Promise<Connection>;
    close(drainTime?: number): Promise<void>;
  }

  export interface PoolAttributes {
    user?: string;
    password?: string;
    connectString?: string;
    poolMin?: number;
    poolMax?: number;
    poolIncrement?: number;
    poolTimeout?: number;
  }

  export function createPool(attrs: PoolAttributes): Promise<Pool>;
  export function getConnection(attrs: PoolAttributes): Promise<Connection>;
}
