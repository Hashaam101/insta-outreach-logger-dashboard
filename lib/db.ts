import oracledb from 'oracledb';
import type { Pool, Connection, BindParameters } from 'oracledb';
import { env } from './env';

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const globalForOracle = globalThis as unknown as {
  oraclePool: Pool | undefined;
};

async function getPool(): Promise<Pool> {
  if (!globalForOracle.oraclePool) {
    globalForOracle.oraclePool = await oracledb.createPool({
      user: env.ORACLE_USER,
      password: env.ORACLE_PASSWORD,
      connectString: env.ORACLE_CONN_STRING,
      poolMin: 1,
      poolMax: 10, // Back to standard, we will optimize usage instead
      poolIncrement: 1,
      poolTimeout: 60,
    });
    console.log('✅ Oracle DB Pool Initialized');
  }
  return globalForOracle.oraclePool;
}

export async function dbQuery<T = any>(sql: string, params: BindParameters = []): Promise<T[]> {
  let connection: Connection | undefined;
  try {
    const pool = await getPool();
    connection = await pool.getConnection();
    
    // Explicitly set fetch limits to avoid buffer issues
    const options = {
        prefetchRows: 50,
        fetchArraySize: 50
    };

    const result = await connection.execute<T>(sql, params, options);
    
    if (!sql.trim().toUpperCase().startsWith('SELECT')) {
         await connection.commit();
    }

    return result.rows || [];
  } catch (error) {
    console.error('❌ Database Query Error:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

export default getPool;