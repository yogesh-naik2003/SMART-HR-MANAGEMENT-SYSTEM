const fs = require("fs");
const pool = require("../config/db");
const createAuditLog = require("../services/auditService");
const { success, error } = require("../utils/apiResponse");

exports.uploadEmployeeDocument =
async (req,res)=>{

 try{

  const employeeId =
  req.body.employee_id;

  if (!employeeId || !req.file) {
   return error(res, "employee_id and document are required", 400);
  }

  const filePath =
  req.file.path;

  const result =
  await pool.query(

   `
   INSERT INTO employee_documents
   (
    employee_id,
    document_name,
    file_path
   )
   VALUES
   ($1,$2,$3)
   RETURNING *
   `,

   [
    employeeId,
    req.file.originalname,
    filePath
   ]

  );

  await createAuditLog(
   req.user.userId,
   "UPLOAD_DOCUMENT",
   "EMPLOYEE_DOCUMENT",
   result.rows[0].id,
   `Uploaded document ${req.file.originalname} for employee ${employeeId}`
  );

  return success(res, result.rows[0], 201);

 }catch(err){

  return error(res, err.message, 500);

 }

};

exports.getEmployeeDocuments =
async (req,res)=>{

 try{

  const employeeId =
  req.params.employeeId;

  const employeeResult = await pool.query(
   "SELECT user_id FROM employees WHERE id = $1",
   [employeeId]
  );

  if (employeeResult.rows.length > 0) {
   const ownerUserId = employeeResult.rows[0].user_id;
   const isOwner = ownerUserId && ownerUserId === req.user.userId;
   const isAdmin = req.user.roleId === 1;

   if (!isOwner && !isAdmin) {
    return error(res, "Access Denied", 403);
   }
  }

  const result =
  await pool.query(

   `
   SELECT *
   FROM employee_documents
   WHERE employee_id=$1
   `,

   [employeeId]

  );

  return success(res, result.rows);

 }catch(err){

  return error(res, err.message, 500);

 }

};

exports.deleteEmployeeDocument = async (req, res) => {
 try {
  const documentId = req.params.id;

  const existingDocument = await pool.query(
   "SELECT id, file_path FROM employee_documents WHERE id = $1",
   [documentId]
  );

  if (existingDocument.rows.length === 0) {
   return error(res, "Document not found", 404);
  }

  if (req.user.roleId !== 1) {
   return error(res, "Access Denied", 403);
  }

  if (
   existingDocument.rows[0].file_path &&
   fs.existsSync(existingDocument.rows[0].file_path)
  ) {
   fs.unlinkSync(existingDocument.rows[0].file_path);
  }

  const result = await pool.query(
   "DELETE FROM employee_documents WHERE id = $1 RETURNING *",
   [documentId]
  );

  await createAuditLog(
   req.user.userId,
   "DELETE_DOCUMENT",
   "EMPLOYEE_DOCUMENT",
   documentId,
   `Deleted document ${documentId}`
  );

  return success(res, result.rows[0]);
 } catch (err) {
  return error(res, err.message, 500);
 }
};
