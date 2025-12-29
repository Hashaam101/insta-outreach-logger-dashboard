import oracledb from 'oracledb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function run() {
  console.log('🌱 Starting Database Seeding...');

  let connection: oracledb.Connection | undefined;

  try {
    const connStr = (process.env.ORACLE_CONN_STRING || '').replace(/\s+/g, '');
    
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: connStr,
    });

    console.log('✅ Connected to Oracle');

    const seedPath = path.join(process.cwd(), 'lib/db/seeds/001_mock_data.sql');
    console.log(`📄 Reading seed file: ${seedPath}`);
    const sqlContent = fs.readFileSync(seedPath, 'utf8');

    // Simple split by semicolon for execution
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`🛠️  Executing ${statements.length} seed statements...`);

    for (const sql of statements) {
      try {
        await connection.execute(sql);
        
        // Log progress for inserts
        if (sql.toUpperCase().includes('INSERT INTO')) {
            const match = sql.match(/INSERT INTO\s+(\w+)/i);
            const table = match ? match[1] : 'unknown';
             process.stdout.write(`   - Inserted into ${table}\r`);
        }
      } catch (err) {
        const error = err as Error;
        console.error(`\n   ❌ Error executing SQL:\n${sql.substring(0, 50)}...\nReason: ${error.message}`);
      }
    }

    await connection.commit();
    console.log('\n✅ Seeding Complete!');

  } catch (err) {
    console.error('\n❌ Fatal Error:', err);
    process.exit(1);
  } finally {
    if (connection) {
      try { await connection.close(); } catch {}
    }
  }
}

run();
