const pool = require("../config/db");
const createAuditLog =
require("../services/auditService");
const { sendTrackedEmail } = require("../services/mailer");
const { getCache, setCache, deleteCache } = require("../utils/cache");
const { invalidateDashboardSummary } = require("../services/cacheService");
const welcomeTemplate = require("../templates/welcomeEmail");
const { success, error } = require("../utils/apiResponse");
exports.createEmployee = async (
  req,
  res
) => {

  try {

    const {
      user_id,
      employee_code,
      department_id,
      designation,
      joining_date,
      salary,
      phone,
      address
    } = req.body;

    const result =
      await pool.query(

      `INSERT INTO employees
      (
        user_id,
        employee_code,
        department_id,
        designation,
        joining_date,
        salary,
        phone,
        address
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,

      [
        user_id,
        employee_code,
        department_id,
        designation,
        joining_date,
        salary,
        phone,
        address
      ]
    );

    await createAuditLog(
      req.user.userId,
      "CREATE_EMPLOYEE",
      "EMPLOYEE",
      result.rows[0].id,
      `Created employee ${employee_code}`
    );

    if (user_id) {
      const userResult = await pool.query(
        "SELECT email, name FROM users WHERE id = $1",
        [user_id]
      );

      if (userResult.rows.length > 0) {
        await sendTrackedEmail({
          userId: user_id,
          type: "WELCOME_EMAIL",
          recipient: userResult.rows[0].email,
          subject: "Welcome to Company",
          html: welcomeTemplate(userResult.rows[0].name),
          entityType: "EMPLOYEE",
          entityId: result.rows[0].id
        });
      }
    }

    await invalidateDashboardSummary();
    await deleteCache("employees_list");

    return success(res, result.rows[0], 201);

  } catch (err) {

    return error(res, err.message, 500);

  }

};
exports.getEmployees =
async (req,res)=>{

  try{

    const cachedData = await getCache("employees_list");
    if (cachedData) {
      return success(res, JSON.parse(cachedData));
    }

    const result =
    await pool.query(
      `SELECT e.*,
       d.department_name
       FROM employees e
       LEFT JOIN departments d
       ON e.department_id=d.id`
    );

    await setCache("employees_list", JSON.stringify(result.rows), 30);
    return success(res, result.rows);

  }catch(err){

    return error(res, err.message, 500);

  }

};

exports.updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const {
      employee_code,
      department_id,
      designation,
      joining_date,
      salary,
      phone,
      address
    } = req.body || {};

    const existing = await pool.query("SELECT id FROM employees WHERE id = $1", [employeeId]);
    if (existing.rows.length === 0) {
      return error(res, "Employee not found", 404);
    }

    const result = await pool.query(
      `UPDATE employees
       SET employee_code = COALESCE($1, employee_code),
           department_id = COALESCE($2, department_id),
           designation = COALESCE($3, designation),
           joining_date = COALESCE($4, joining_date),
           salary = COALESCE($5, salary),
           phone = COALESCE($6, phone),
           address = COALESCE($7, address)
       WHERE id = $8
       RETURNING *`,
      [employee_code, department_id, designation, joining_date, salary, phone, address, employeeId]
    );

    await createAuditLog(
      req.user.userId,
      "UPDATE_EMPLOYEE",
      "EMPLOYEE",
      employeeId,
      `Updated employee ${employeeId}`
    );

    await invalidateDashboardSummary();
    await deleteCache("employees_list");

    return success(res, result.rows[0]);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const existing = await pool.query("SELECT id FROM employees WHERE id = $1", [employeeId]);
    if (existing.rows.length === 0) {
      return error(res, "Employee not found", 404);
    }

    const result = await pool.query(
      "DELETE FROM employees WHERE id = $1 RETURNING *",
      [employeeId]
    );

    await createAuditLog(
      req.user.userId,
      "DELETE_EMPLOYEE",
      "EMPLOYEE",
      employeeId,
      `Deleted employee ${employeeId}`
    );

    await invalidateDashboardSummary();
    await deleteCache("employees_list");

    return success(res, result.rows[0]);
  } catch (err) {
    return error(res, err.message, 500);
  }
};
