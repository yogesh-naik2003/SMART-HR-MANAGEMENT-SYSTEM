const pool = require('./src/config/db');

async function run() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='performance_reviews';
    `);
    console.log("performance_reviews cols:", res.rows.map(r => r.column_name));
  } catch(e) { console.log(e); }

  try {
    const res2 = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='applications';
    `);
    console.log("applications cols:", res2.rows.map(r => r.column_name));
  } catch(e) { console.log(e); }

  process.exit(0);
}
run();
