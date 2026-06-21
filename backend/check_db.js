const pool = require('./src/config/db');

async function check() {
  try {
    const res = await pool.query('SELECT * FROM leave_types LIMIT 1');
    console.log(res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
