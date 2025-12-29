import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// ==========================================
// CONFIGURATION
// ==========================================
const NUM_OPERATORS = 6;
const NUM_ACTORS = 20;
const NUM_TARGETS = 200;
const NUM_LOGS = 500;

const RESTAURANT_NAMES = [
    "The Golden Spoon", "Blue Ocean Grill", "Mama Mia Pizzeria", "Steak & Co", "Urban Garden",
    "Sushi Zen", "The Rusty Anchor", "Parisian Bistro", "Wok & Roll", "The Taco Stand",
    "Mediterranean Breeze", "Southern Soul Food", "The Burger Joint", "Green Leaf Salad Bar", "Pasta Palace",
    "Dragon Palace", "Little India", "The Breakfast Club", "Coastal Catch", "Sky High Rooftop",
    "Rustic Roast", "Midnight Munchies", "Sweet Treats Bakery", "The Wine Cellar", "Fresh Harvest",
    "Iron Grill", "Velvet Velvet", "Sapphire Lounge", "Pearl Cafe", "Emerald Kitchen"
];

const ACTOR_USERNAMES = [
    "insta_growth_pro", "marketing_maven", "social_spark", "connect_hub", "reach_plus",
    "impact_outreach", "viral_agent", "prime_connect", "global_outreach", "lead_gen_master",
    "buzz_booster", "scale_social", "vision_outreach", "trend_setter_hq", "pixel_perfect_ads",
    "engagement_ninja", "growth_hacker_x", "social_media_star", "outreach_orbit", "brand_builder_v2"
];

const MESSAGES = [
    "Hey! Love your restaurant's vibe. Do you offer catering services?",
    "Hello! Saw your menu online, looks amazing. Are you open for collaborations?",
    "Hi there, we're looking for local spots to host our upcoming team event. Do you have private dining?",
    "Greetings! Your seasonal specials caught our eye. Would love to feature them on our platform.",
    "Hey! Just wanted to say your food photography is top-tier. Keep it up!",
    "Hi, do you guys have any vegan options on your current menu?",
    "Hello! Are you planning any special events for New Year's Eve?",
    "Hi team, just sent a query via your website. Looking forward to hearing back!",
    "Hey! Do you accept group bookings for more than 15 people?",
    "Your outdoor seating looks lovely. Is it pet friendly?"
];

const TARGET_OP_NAME = "Hashaam Zahid";

function generateId(prefix: string, length: number = 8): string {
    const chars = '0123456789ABCDEF';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${result}`;
}

async function run() {
    console.log('🚀 Starting Massive Data Generation...');
    let conn: oracledb.Connection | undefined;

    try {
        conn = await oracledb.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: (process.env.ORACLE_CONN_STRING || '').replace(/\s+/g, ''),
        });

        console.log('✅ Connected to Oracle.');

        // 1. CLEANING PREVIOUS DATA
        console.log('🧹 Cleaning old data...');
        await conn.execute(`DELETE FROM OUTREACH_LOGS`);
        await conn.execute(`DELETE FROM EVENT_LOGS`);
        await conn.execute(`DELETE FROM GOALS`);
        await conn.execute(`DELETE FROM RULES`);
        await conn.execute(`DELETE FROM ACTORS`);
        await conn.execute(`DELETE FROM TARGETS`);
        await conn.execute(`DELETE FROM OPERATORS WHERE OPR_NAME != :name`, { name: TARGET_OP_NAME });

        // Ensure at least 6 operators
        const existingOps = await conn.execute<{ OPR_ID: string, OPR_NAME: string }>
            (`SELECT OPR_ID, OPR_NAME FROM OPERATORS`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const ops = existingOps.rows || [];
        
        const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Edward", "Fiona", "George"];
        const lastNames = ["Smith", "Jones", "Brown", "Wilson", "Taylor", "Miller", "Davis"];

        console.log('👥 Generating Operators...');
        while (ops.length < NUM_OPERATORS) {
            const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
            const id = generateId('OPR');
            const email = `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
            
            try {
                await conn.execute(
                    `INSERT INTO OPERATORS (OPR_ID, OPR_EMAIL, OPR_NAME, OPR_STATUS, CREATED_AT, LAST_ACTIVITY)
                     VALUES (:id, :email, :name, 'online', SYSTIMESTAMP - 30, SYSTIMESTAMP)`,
                    { id, email, name }
                );
                ops.push({ OPR_ID: id, OPR_NAME: name });
            } catch (_e) { /* skip dupes */ }
        }

        // 2. Generate 20 Actors
        console.log('🤖 Generating 20 Actors...');
        const actors: { ACT_ID: string, ACT_USERNAME: string, OPR_ID: string }[] = [];
        for (let i = 0; i < NUM_ACTORS; i++) {
            const handle = ACTOR_USERNAMES[i] || `actor_${i}`;
            const id = generateId('ACT');
            const op = ops[i % ops.length];
            const status = Math.random() > 0.1 ? 'Active' : 'Suspended By Team';

            await conn.execute(
                `INSERT INTO ACTORS (ACT_ID, ACT_USERNAME, OPR_ID, ACT_STATUS, CREATED_AT, LAST_ACTIVITY)
                 VALUES (:id, :handle, :opr, :status, SYSTIMESTAMP - 20, SYSTIMESTAMP)`,
                { id, handle, opr: op.OPR_ID, status }
            );
            actors.push({ ACT_ID: id, ACT_USERNAME: handle, OPR_ID: op.OPR_ID });
        }

        // 3. Generate 200 Targets (Restaurants)
        console.log('🎯 Generating 200 Target Profiles...');
        const targets: string[] = [];
        const statuses = ['Cold No Reply', 'Replied', 'Warm', 'Booked', 'Paid', 'Excluded'];
        
        for (let i = 0; i < NUM_TARGETS; i++) {
            const baseName = RESTAURANT_NAMES[i % RESTAURANT_NAMES.length];
            const username = `${baseName.toLowerCase().replace(/[^a-z]/g, '_')}_${i}`;
            const id = generateId('TAR');
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const email = Math.random() > 0.4 ? `info@${username.split('_')[0]}.com` : 'N/S';
            const phone = Math.random() > 0.6 ? `+1-555-${Math.floor(1000 + Math.random() * 9000)}` : 'N/S';
            
            const firstContactDaysAgo = Math.random() * 15;
            const lastUpdatedDaysAgo = Math.random() * 2;

            await conn.execute(
                `INSERT INTO TARGETS (TAR_ID, TAR_USERNAME, TAR_STATUS, FIRST_CONTACTED, NOTES, LAST_UPDATED, EMAIL, PHONE_NUM, CONT_SOURCE)
                 VALUES (:id, :u, :s, SYSTIMESTAMP - :fc, 'Managed prospect profile.', SYSTIMESTAMP - :lu, :e, :p, 'Instagram Search')`,
                { id, u: username, s: status, e: email, p: phone, fc: firstContactDaysAgo, lu: lastUpdatedDaysAgo }
            );
            targets.push(id);
        }

        // 4. Generate 500 Activity Logs spread across 14 days
        console.log('📝 Logging 500 Activity Events...');
        const eventTypes = ['Outreach', 'Change in Tar Info', 'Tar Exception Toggle'];
        
        for (let i = 0; i < NUM_LOGS; i++) {
            const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            const actor = actors[Math.floor(Math.random() * actors.length)];
            const target = targets[Math.floor(Math.random() * targets.length)];
            const id = generateId('ELG', 10);
            const daysAgo = Math.random() * 14;
            
            await conn.execute(
                `INSERT INTO EVENT_LOGS (ELG_ID, EVENT_TYPE, ACT_ID, OPR_ID, TAR_ID, DETAILS, CREATED_AT)
                 VALUES (:id, :type, :act, :opr, :tar, :det, SYSTIMESTAMP - :days)`,
                {
                    id,
                    type,
                    act: actor.ACT_ID,
                    opr: actor.OPR_ID,
                    tar: target,
                    det: `Logged ${type} event via fleet node.`, 
                    days: daysAgo
                }
            );

            if (type === 'Outreach') {
                const olgId = generateId('OLG', 10);
                const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
                await conn.execute(
                    `INSERT INTO OUTREACH_LOGS (OLG_ID, ELG_ID, MESSAGE_TEXT, SENT_AT)
                     VALUES (:id, :eid, :msg, SYSTIMESTAMP - :days)`,
                    { id: olgId, eid: id, msg, days: daysAgo }
                );
            }
        }

        // 5. Generate some Goals and Rules
        console.log('🏆 Setting up Goals and Rules...');
        const metrics = ['Total Messages Sent', 'Unique Profiles Contacted', 'Replies Received'];
        for (let i = 0; i < 3; i++) {
            await conn.execute(
                `INSERT INTO GOALS (GOAL_ID, METRIC, TARGET_VALUE, FREQUENCY, STATUS, CREATED_AT, START_DATE)
                 VALUES (:id, :metric, :val, 'Daily', 'Active', SYSTIMESTAMP, SYSTIMESTAMP)`,
                {
                    id: generateId('GOL', 10),
                    metric: metrics[i],
                    val: Math.floor(100 + Math.random() * 900)
                }
            );
        }

        await conn.execute(
            `INSERT INTO RULES (RULE_ID, TYPE, METRIC, LIMIT_VALUE, TIME_WINDOW_SEC, STATUS, CREATED_AT)
             VALUES (:id, 'Frequency Cap', 'Total Messages Sent', 50, 3600, 'Active', SYSTIMESTAMP)`,
            { id: generateId('RUL', 10) }
        );

        await conn.commit();
        console.log('\n✨ Data Generation Complete! Database is now rich and realistic.');

    } catch (err) {
        console.error('\n❌ Generation Failed:', err);
    } finally {
        if (conn) await conn.close();
    }
}

run();
