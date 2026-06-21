const pool = require('./src/config/db');

async function run() {
  try {
    const res = await pool.query(`
      SELECT eg.*, g.title, g.description, e.employee_code, u.name as employee_name
      FROM employee_goals eg
      JOIN goals g ON eg.goal_id = g.id
      JOIN employees e ON eg.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      ORDER BY eg.id DESC
    `);
    console.log("Goals successful!");
  } catch(e) {
    console.log("Goals error:", e.message);
  }

  try {
    const res2 = await pool.query(`
      SELECT pr.*, e.employee_code, u.name as employee_name, rev.name as reviewer_name
      FROM performance_reviews pr
      JOIN employees e ON pr.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      LEFT JOIN users rev ON pr.reviewer_id = rev.id
      ORDER BY pr.review_date DESC
    `);
    console.log("Reviews successful!");
  } catch(e) {
    console.log("Reviews error:", e.message);
  }

  try {
    const res3 = await pool.query(`
      SELECT j.*, d.department_name
      FROM job_posts j
      LEFT JOIN departments d ON j.department_id = d.id
      ORDER BY j.created_at DESC
    `);
    console.log("Jobs successful!");
  } catch(e) {
    console.log("Jobs error:", e.message);
  }

  try {
    const res4 = await pool.query(`
      SELECT c.*, a.status, j.title as applied_job
      FROM candidates c
      LEFT JOIN applications a ON c.id = a.candidate_id
      LEFT JOIN job_posts j ON a.job_post_id = j.id
      ORDER BY c.created_at DESC
    `);
    console.log("Candidates successful!");
  } catch(e) {
    console.log("Candidates error:", e.message);
  }
  
  process.exit(0);
}
run();
