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
      `
    );

    await setCache("attendance_list", JSON.stringify(result.rows), 30);
    return success(res, result.rows);

  }catch(err){
    return error(res, err.message, 500);
  }
};
