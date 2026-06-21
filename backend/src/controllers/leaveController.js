const pool = require("../config/db");
const createAuditLog = require("../services/auditService");
const { sendTrackedEmail } = require("../services/mailer");
const leaveApprovedTemplate = require("../templates/leaveApprovedEmail");
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
  `INSERT INTO notifications
   (user_id, title, message)
   VALUES ($1, $2, $3)`,
 [employeeResult.rows[0].user_id, title, message]
 );
}

async function sendLeaveApprovedEmail(employeeId, leaveId) {
 const employeeResult = await pool.query(
  `SELECT u.email, u.name
   FROM employees e
   JOIN users u ON e.user_id = u.id
   WHERE e.id = $1`,
  [employeeId]
 );

 if (employeeResult.rows.length === 0) {
  return;
 }

 const employee = employeeResult.rows[0];
 await sendTrackedEmail({
  userId: null,
  type: "LEAVE_APPROVED_EMAIL",
  recipient: employee.email,
  subject: "Leave Approved",
  html: leaveApprovedTemplate(employee.name),
  entityType: "LEAVE_REQUEST",
  entityId: leaveId
 });
}

exports.applyLeave = async (req,res)=>{

 try{

  const {
   employee_id,
   leave_type_id,
   start_date,
   end_date,
   reason
  } = req.body;

  if (
   !employee_id ||
   !leave_type_id ||
   !start_date ||
   !end_date ||
   !reason
  ) {
   return error(res, "employee_id, leave_type_id, start_date, end_date and reason are required", 400);
  }

  if (new Date(start_date) > new Date(end_date)) {
   return error(res, "start_date cannot be after end_date", 400);
  }

  const result =
  await pool.query(

   `INSERT INTO leave_requests
   (
    employee_id,
    leave_type_id,
    start_date,
    end_date,
    reason
   )
   VALUES
   ($1,$2,$3,$4,$5)
   RETURNING *`,

   [
    employee_id,
    leave_type_id,
    start_date,
    end_date,
    reason
   ]

  );

  return success(res, result.rows[0], 201);

 }catch(err){

  return error(res, err.message, 500);

 }

};

exports.approveLeave =
async (req,res)=>{

 try{

  const leaveId =
  req.params.id;

  const approverId =
  req.user.userId;

  const existingLeave =
  await pool.query(
  "SELECT id, status, employee_id FROM leave_requests WHERE id = $1",
  [leaveId]
  );

  if (existingLeave.rows.length === 0) {
   return error(res, "Leave request not found", 404);
  }

  if (existingLeave.rows[0].status !== "PENDING") {
   return error(res, "Leave request has already been processed", 409);
  }

  const result =
  await pool.query(

  `
  UPDATE leave_requests
  SET
  status='APPROVED',
  approved_by=$1
  WHERE id=$2
  RETURNING *
  `,

  [approverId,leaveId]

  );

  await createAuditLog(
   req.user.userId,
   "APPROVE_LEAVE",
   "LEAVE_REQUEST",
   leaveId,
   "Leave request approved"
  );

  await notifyEmployee(
   existingLeave.rows[0].employee_id,
   "Leave Approved",
   "Your leave has been approved"
  );

  await sendLeaveApprovedEmail(existingLeave.rows[0].employee_id, leaveId);

  return success(res, result.rows[0]);

 }catch(err){

  return error(res, err.message, 500);

 }

};


exports.rejectLeave =
async (req,res)=>{

 try{

  const leaveId =
  req.params.id;

  const approverId =
  req.user.userId;

  const existingLeave =
  await pool.query(
  "SELECT id, status, employee_id FROM leave_requests WHERE id = $1",
  [leaveId]
  );

  if (existingLeave.rows.length === 0) {
   return error(res, "Leave request not found", 404);
  }

  if (existingLeave.rows[0].status !== "PENDING") {
   return error(res, "Leave request has already been processed", 409);
  }

  const result =
  await pool.query(

  `
  UPDATE leave_requests
  SET
  status='REJECTED',
  approved_by=$1
  WHERE id=$2
  RETURNING *
  `,

  [approverId,leaveId]

  );

  await createAuditLog(
   req.user.userId,
   "REJECT_LEAVE",
   "LEAVE_REQUEST",
   leaveId,
   "Leave request rejected"
  );

  await notifyEmployee(
   existingLeave.rows[0].employee_id,
   "Leave Rejected",
   "Your leave has been rejected"
  );

  return success(res, result.rows[0]);

 }catch(err){

  return error(res, err.message, 500);

 }

};

exports.getLeaves =
async (req,res)=>{

 try{

  const result =
  await pool.query(
  `
  SELECT
  lr.*,
  e.employee_code,
  lt.leave_name as leave_type_name
  FROM leave_requests lr
  JOIN employees e ON lr.employee_id = e.id
  LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
  `
  );

  return success(res, result.rows);

 }catch(err){

  return error(res, err.message, 500);

 }
};

exports.getLeaveTypes = async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, leave_name as name FROM leave_types ORDER BY id`);
    return success(res, result.rows);
  } catch (err) {
    return error(res, err.message, 500);
  }
};
