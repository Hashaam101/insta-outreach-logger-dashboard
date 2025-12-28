import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const TARGET_OP_NAME = "Hashaam Zahid";

async function run() {
  console.log('🌱 Generating Rich Sample Data...');

  let connection: oracledb.Connection | undefined;

  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: (process.env.ORACLE_CONN_STRING || '').replace(/\s+/g, ''),
    });

    console.log('✅ Connected.');

    // 1. Get/Ensure Operators
    // We assume Hashaam Zahid exists (from user prompt), but let's fetch him.
    const opsResult = await connection.execute<{ OPR_ID: string, OPR_NAME: string }>(
      `SELECT OPR_ID, OPR_NAME FROM OPERATORS`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    let operators = opsResult.rows || [];
    let hashaam = operators.find(o => o.OPR_NAME === TARGET_OP_NAME);

    if (!hashaam) {
        console.log(`⚠️ Operator '${TARGET_OP_NAME}' not found. Please log in first or renaming existing.`);
        // Fallback to first operator if exists
        hashaam = operators[0];
    }

    if (!hashaam) {
        console.error("❌ No operators found. Run seed script first.");
        return;
    }

    console.log(`🎯 Targeting Operator: ${hashaam.OPR_NAME} (${hashaam.OPR_ID})`);

    // 2. Generate Actors for Hashaam
    const actorPrefixes = ['growth', 'marketing', 'sales', 'connect', 'social'];
    const actorSuffixes = ['_pro', '_official', '_hq', '_x', '_v2'];
    
    for (let i = 0; i < 3; i++) {
        const username = `${actorPrefixes[i % actorPrefixes.length]}_${hashaam.OPR_NAME.split(' ')[0].toLowerCase()}${actorSuffixes[i % actorSuffixes.length]}`;
        const actId = `ACT-${Date.now().toString(16).slice(-4).toUpperCase()}${Math.floor(Math.random()*1000)}`;
        
        // Check if exists
        const check = await connection.execute(`SELECT 1 FROM ACTORS WHERE ACT_USERNAME = :u`, [username]);
        if (!check.rows || check.rows.length === 0) {
            await connection.execute(
                `INSERT INTO ACTORS (ACT_ID, ACT_USERNAME, OPR_ID, ACT_STATUS, CREATED_AT, LAST_ACTIVITY)
                 VALUES (:id, :u, :opr, 'Active', SYSTIMESTAMP, SYSTIMESTAMP)`,
                { id: actId, u: username, opr: hashaam.OPR_ID }
            );
            console.log(`   + Actor: @${username}`);
        }
    }

    // Refresh Actors list
    const actorsResult = await connection.execute<{ ACT_ID: string, ACT_USERNAME: string, OPR_ID: string }>(
        `SELECT ACT_ID, ACT_USERNAME, OPR_ID FROM ACTORS`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const allActors = actorsResult.rows || [];
    const myActors = allActors.filter(a => a.OPR_ID === hashaam?.OPR_ID);

    // 3. Generate Targets & Logs (Activity for Today)
    const today = new Date();
    
    for (let i = 0; i < 15; i++) {
        const tarName = `prospect_${Math.floor(Math.random() * 10000)}`;
        const tarId = `TAR-${Date.now().toString(16).slice(-5).toUpperCase()}${i}`;
        const actor = myActors[i % myActors.length] || myActors[0];
        
        // Status distribution
        const statusRoll = Math.random();
        let status = 'Cold No Reply';
        if (statusRoll > 0.7) status = 'Replied';
        if (statusRoll > 0.9) status = 'Booked';

        // Insert Target
        try {
            await connection.execute(
                `INSERT INTO TARGETS (TAR_ID, TAR_USERNAME, TAR_STATUS, FIRST_CONTACTED, NOTES, LAST_UPDATED, EMAIL, PHONE_NUM, CONT_SOURCE)
                 VALUES (:id, :u, :s, SYSTIMESTAMP, 'Auto-generated', SYSTIMESTAMP, 'N/S', 'N/S', 'IG')`,
                { id: tarId, u: tarName, s: status }
            );
        } catch (e) { /* Ignore dupes */ }

        // Log Events (Activity for Today)
        // Adjust time to be within last 24h
        const hoursAgo = Math.floor(Math.random() * 12); // 0-12 hours ago
        
        const elgId = `ELG-${Date.now().toString(16).slice(-6)}${i}`;
        const olgId = `OLG-${Date.now().toString(16).slice(-6)}${i}`;

        await connection.execute(
            `INSERT INTO EVENT_LOGS (ELG_ID, EVENT_TYPE, ACT_ID, OPR_ID, TAR_ID, DETAILS, CREATED_AT)
             VALUES (:id, 'Outreach', :act, :opr, :tar, 'Sample outreach', SYSTIMESTAMP - NUMTODSINTERVAL(:h, 'HOUR'))`,
            { id: elgId, act: actor.ACT_ID, opr: hashaam.OPR_ID, tar: tarId, h: hoursAgo }
        );

        await connection.execute(
            `INSERT INTO OUTREACH_LOGS (OLG_ID, ELG_ID, MESSAGE_TEXT, SENT_AT)
             VALUES (:id, :eid, 'Hey, saw your post! awesome stuff.', SYSTIMESTAMP - NUMTODSINTERVAL(:h, 'HOUR'))`,
            { id: olgId, eid: elgId, h: hoursAgo }
        );
    }

    console.log(`   + Generated 15 targets and logs for today.`);

    await connection.commit();
    console.log('✅ Done.');

  } catch (err) {
    console.error(err);
  } finally {
    if (connection) await connection.close();
  }
}

run();
