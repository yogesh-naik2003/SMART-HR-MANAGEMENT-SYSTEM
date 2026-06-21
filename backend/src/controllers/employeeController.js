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

    if (user_id) {
      const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [user_id]);
      if (userCheck.rows.length === 0) {
        return error(res, "System Account User ID not found. Please leave it blank or provide a valid user ID.", 404);
      }
    }

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
exports.getEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const pageVal = Math.max(parseInt(page, 10), 1);
    const limitVal = Math.max(parseInt(limit, 10), 1);
    const offsetVal = (pageVal - 1) * limitVal;
    const searchStr = String(search).trim();

    const cacheKey = `employees_list_${pageVal}_${limitVal}_${searchStr || "all"}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return success(res, JSON.parse(cachedData));
    }

    let baseQuery = `
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.user_id = u.id
    `;
    let countQuery = `SELECT COUNT(*) ${baseQuery}`;
    let dataQuery = `SELECT e.*, d.department_name, u.name, u.email ${baseQuery}`;
    const queryParams = [];

    if (searchStr) {
      const searchClause = ` WHERE u.name ILIKE $1 OR u.email ILIKE $1 OR e.employee_code ILIKE $1 OR d.department_name ILIKE $1`;
      countQuery += searchClause;
      dataQuery += searchClause;
      queryParams.push(`%${searchStr}%`);
    }

    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count, 10);

    dataQuery += ` ORDER BY e.id DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limitVal, offsetVal);

    const dataResult = await pool.query(dataQuery, queryParams);

    const payload = {
      data: dataResult.rows,
      meta: {
        total,
        page: pageVal,
        limit: limitVal,
        totalPages: Math.ceil(total / limitVal)
      }
    };

    await setCache(cacheKey, JSON.stringify(payload), 30);
    return success(res, payload);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getEmployeeProfile = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const employeeRes = await pool.query(`
      SELECT e.*, d.department_name, u.name, u.email
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = $1
    `, [employeeId]);

    if (employeeRes.rows.length === 0) {
      return error(res, "Employee not found", 404);
    }

    const employee = employeeRes.rows[0];

    const attendanceRes = await pool.query(`
      SELECT * FROM attendance WHERE employee_id = $1 ORDER BY attendance_date DESC LIMIT 30
    `, [employeeId]);

    const leavesRes = await pool.query(`
      SELECT lr.*, lt.leave_name as leave_type_name
      FROM leave_requests lr
      LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
      WHERE lr.employee_id = $1 ORDER BY created_at DESC
    `, [employeeId]);

    const payrollRes = await pool.query(`
      SELECT * FROM payroll WHERE employee_id = $1 ORDER BY year DESC, month DESC
    `, [employeeId]);

    const documentsRes = await pool.query(`
      SELECT * FROM employee_documents WHERE employee_id = $1 ORDER BY created_at DESC
    `, [employeeId]);

    const performanceRes = await pool.query(`
      SELECT pr.*, u.name as reviewer_name
      FROM performance_reviews pr
      LEFT JOIN users u ON pr.reviewer_id = u.id
      WHERE pr.employee_id = $1 ORDER BY review_date DESC
    `, [employeeId]);

    return success(res, {
      profile: employee,
      attendance: attendanceRes.rows,
      leaves: leavesRes.rows,
      payroll: payrollRes.rows,
      documents: documentsRes.rows,
      performance: performanceRes.rows
    });
  } catch (err) {
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
