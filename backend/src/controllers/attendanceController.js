const pool = require("../config/db");
const { getCache, setCache } = require("../utils/cache");
const { success, error } = require("../utils/apiResponse");

async function notifyEmployee(employeeId, title, message) {
  const employeeResult = await pool.query(
    "SELECT user_id FROM employees WHERE id = $1",
    [employeeId]
  );

  if (employeeResult.rows.length === 0 || !employeeResult.rows[0].user_id) {
    return;
  }

  await pool.query(
    `INSERT INTO notifications (user_id, title, message)
     VALUES ($1, $2, $3)`,
    [employeeResult.rows[0].user_id, title, message]
  );
}

exports.checkIn = async (req, res) => {
  try {
    const { employee_id } = req.body || {};

    if (!employee_id) {
      return error(res, "employee_id is required", 400);
    }

    const employeeCheck = await pool.query("SELECT id FROM employees WHERE id = $1", [employee_id]);
    if (employeeCheck.rows.length === 0) {
      return error(res, "Employee record not found for this account", 404);
    }

    const existingAttendance = await pool.query(
      `
      SELECT id, check_in, check_out
      FROM attendance
      WHERE employee_id = $1
        AND attendance_date = CURRENT_DATE
      `,
      [employee_id]
    );

    if (existingAttendance.rows.length > 0) {
      return error(res, "Attendance already marked for today", 409);
    }

    const result = await pool.query(
      `
      INSERT INTO attendance
      (
        employee_id,
        attendance_date,
        check_in
      )
      VALUES
      (
        $1,
        CURRENT_DATE,
        NOW()
      )
      RETURNING *
      `,
      [employee_id]
    );

    await notifyEmployee(
      employee_id,
      "Attendance Marked",
      "Your check-in has been recorded"
    );

    return success(res, result.rows[0], 201);

  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { employee_id } = req.body || {};

    if (!employee_id) {
      return error(res, "employee_id is required", 400);
    }

    const result = await pool.query(
      `
      UPDATE attendance
      SET
      check_out = NOW(),

      working_hours =
      EXTRACT(
      EPOCH FROM
      (
       NOW() - check_in
      )) / 3600

      WHERE
      employee_id = $1
      AND attendance_date = CURRENT_DATE

      RETURNING *
      `,
      [employee_id]
    );

    if (result.rows.length === 0) {
      return error(res, "No check-in record found for today", 404);
    }

    await notifyEmployee(
      employee_id,
      "Checked Out",
      "Your check-out has been recorded"
    );

    return success(res, result.rows[0]);

  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getAttendance =
async (req,res)=>{
  try{

    const cachedData = await getCache("attendance_list");
    if (cachedData) {
      return success(res, JSON.parse(cachedData));
    }

    const result =
    await pool.query(
      `
      SELECT
      a.*,
      e.employee_code
      FROM attendance a
      JOIN employees e
      ON a.employee_id=e.id
      ORDER BY a.attendance_date DESC, a.check_in DESC
      `
    );

    await setCache("attendance_list", JSON.stringify(result.rows), 30);
    return success(res, result.rows);

  }catch(err){
    return error(res, err.message, 500);
  }
};

exports.getSummary = async (req, res) => {
  try {
    const summary = await pool.query(`
      SELECT 
        COUNT(id) as present_days,
        COUNT(CASE WHEN check_in::time > '09:15:00' THEN 1 END) as late_days,
        SUM(working_hours) as total_hours
      FROM attendance
      WHERE attendance_date >= CURRENT_DATE - INTERVAL '30 days'
    `);
    
    const present_days = parseInt(summary.rows[0].present_days) || 0;
    const absent_days = Math.max(30 - present_days, 0);

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

    return success(res, {
      present_days,
      absent_days,
      late_days: parseInt(summary.rows[0].late_days) || 0,
      total_hours: Math.round(parseFloat(summary.rows[0].total_hours) || 0),
      trend: trend.rows
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};
