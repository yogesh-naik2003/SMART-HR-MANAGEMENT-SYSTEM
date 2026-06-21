const pool = require('./src/config/db');

async function run() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users';
    `);
    console.log("users cols:", res.rows.map(r => r.column_name));
  } catch(e) { console.log(e); }

  process.exit(0);
}
run();
