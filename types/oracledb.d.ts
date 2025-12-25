declare module 'oracledb' {
  export let outFormat: number;
  export let fetchAsString: number[];
  export const OUT_FORMAT_OBJECT: number;
  
  // Data Types
  export const NUMBER: number;
  export const DATE: number;
  export const CLOB: number;
  export const TIMESTAMP: number;
  export const TIMESTAMP_TZ: number;
  export const TIMESTAMP_LTZ: number;

  export function initOracleClient(options?: any): void;
  export function createPool(poolAttributes: any): Promise<Pool>;
  export interface Pool {
    getConnection(): Promise<Connection>;
  }
  export interface Connection {
    execute<T>(sql: string, bindParams?: any, options?: any): Promise<Result<T>>;
    close(): Promise<void>;
    commit(): Promise<void>;
  }
  export interface Result<T> {
    rows?: T[];
    rowsAffected?: number;
  }
  export type BindParameters = any[] | Record<string, any>;
  
  const oracledb: {
    outFormat: number;
    fetchAsString: number[];
    OUT_FORMAT_OBJECT: number;
    NUMBER: number;
    DATE: number;
    CLOB: number;
    TIMESTAMP: number;
    TIMESTAMP_TZ: number;
    TIMESTAMP_LTZ: number;
    initOracleClient(options?: any): void;
    createPool(poolAttributes: any): Promise<Pool>;
    getConnection(options: any): Promise<Connection>;
  };
  export default oracledb;
}