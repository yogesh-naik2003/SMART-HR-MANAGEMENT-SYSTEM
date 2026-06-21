const pool = require('./src/config/db');

async function check() {
  try {
    const res = await pool.query('SELECT id FROM employees LIMIT 1');
    console.log("EMPLOYEE ID:", res.rows[0]?.id);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
