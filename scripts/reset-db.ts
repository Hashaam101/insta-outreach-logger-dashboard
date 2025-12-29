import oracledb from 'oracledb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Define table names to drop (Order matters: Child first, then Parent)
// Dynamic drop used below instead.


async function run() {
  console.log('🚀 Starting Factory Reset...');

  let connection: oracledb.Connection | undefined;

  try {
    const connStr = (process.env.ORACLE_CONN_STRING || '').replace(/\s+/g, '');
    
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: connStr,
    });

    console.log('✅ Connected to Oracle Database');

    // 1. DROP EXISTING TABLES
    console.log('\n🗑️  Dropping all existing tables...');
    
    // Fetch all tables in the current schema
    const result = await connection.execute<{ TABLE_NAME: string }>(
      `SELECT table_name FROM user_tables`,
      [] as any,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const tables = result.rows?.map(r => r.TABLE_NAME) || [];

    if (tables.length === 0) {
      console.log('   - No tables found.');
    } else {
      for (const table of tables) {
        try {
          // PURGE removes it from Recycle Bin immediately
          await connection.execute(`DROP TABLE "${table}" CASCADE CONSTRAINTS PURGE`);
          console.log(`   - Dropped ${table}`);
        } catch (err) {
          const error = err as Error;
          console.error(`   ❌ Error dropping ${table}:`, error.message);
        }
      }
    }

    // 2. READ MIGRATION FILE
    const migrationPath = path.join(process.cwd(), 'lib/db/migrations/001_initial_schema.sql');
    console.log(`\n📄 Reading migration file: ${migrationPath}`);
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL by semicolons to execute statements individually
    // Note: This simple split assumes semicolons are not part of string literals (e.g. inside CLOBs).
    // Given the schema, this is safe enough for now.
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // 3. EXECUTE MIGRATION
    console.log(`\n🛠️  Applying new schema (${statements.length} statements)...`);
    
    for (const sql of statements) {
        try {
            await connection.execute(sql);
            
            // Extract table name for logging if it's a CREATE TABLE
            const match = sql.match(/CREATE TABLE\s+(\w+)/i);
            if (match) {
                console.log(`   - Created table ${match[1]}`);
            } else {
                console.log(`   - Executed statement`);
            }
        } catch (err) {
            const error = err as Error;
            console.error(`   ❌ Error executing SQL:\n${sql.substring(0, 100)}...\nReason: ${error.message}`);
            throw error;
        }
    }

    // Commit changes
    await connection.commit();
    console.log('\n✅ Factory Reset Complete! Database is fresh.');

  } catch (err) {
    console.error('\n❌ Fatal Error:', err);
    process.exit(1);
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

run();
