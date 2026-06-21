const pool = require('./src/config/db');

async function run() {
  try {
    const summary = await pool.query(`
      SELECT 
        COUNT(id) as present_days,
        COUNT(CASE WHEN check_in::time > '09:15:00' THEN 1 END) as late_days,
        SUM(working_hours) as total_hours
      FROM attendance
      WHERE attendance_date >= CURRENT_DATE - INTERVAL '30 days'
    `);
    console.log("Attendance Summary 1 successful!");
  } catch(e) {
    console.log("Attendance Summary 1 error:", e.message);
  }

  try {
    const trend = await pool.query(`
      SELECT 
        TO_CHAR(attendance_date, 'Mon DD') as name,
        COUNT(id) as present,
        (SELECT COUNT(id) FROM employees) - COUNT(id) as absent
      FROM attendance
      WHERE attendance_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY attendance_date
      ORDER BY attendance_date ASC
    `);
    console.log("Attendance Summary 2 successful!");
  } catch(e) {
    console.log("Attendance Summary 2 error:", e.message);
  }

  process.exit(0);
}
run();
