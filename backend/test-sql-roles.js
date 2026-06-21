const pool = require('./src/config/db');

async function run() {
  try {
    const res = await pool.query(`SELECT * FROM roles;`);
    console.log("roles:", res.rows);
  } catch(e) { console.log(e); }

  process.exit(0);
}
run();
