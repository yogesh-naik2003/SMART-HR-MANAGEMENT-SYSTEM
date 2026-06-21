const pool = require("../config/db");
const { success, error } = require("../utils/apiResponse");
const { getCache, setCache } = require("../utils/cache");
exports.totalEmployees = async (req,res)=>{

 try{

  const result =
  await pool.query(
   `
   SELECT COUNT(*)
   FROM employees
   `
  );

  return success(res, {
   totalEmployees: Number(result.rows[0].count)
  });

 }catch(err){

  return error(res, err.message, 500);

 }

};

exports.totalDepartments =
async (req,res)=>{

 try{

  const result =
  await pool.query(
   `
   SELECT COUNT(*)
   FROM departments
   `
  );

  return success(res, {
   totalDepartments: Number(result.rows[0].count)
  });

 }catch(err){

  return error(res, err.message, 500);

 }

};

exports.totalCandidates =
async (req,res)=>{

 try{

  const result =
  await pool.query(
   `
   SELECT COUNT(*)
   FROM candidates
   `
  );

  return success(res, {
   totalCandidates: Number(result.rows[0].count)
  });

 }catch(err){

  return error(res, err.message, 500);

 }

};

exports.totalOpenJobs =
async (req,res)=>{

 try{

  const result =
  await pool.query(
   `
   SELECT COUNT(*)
   FROM job_posts
   WHERE status='OPEN'
   `
  );

  return success(res, {
   totalOpenJobs: Number(result.rows[0].count)
  });

 }catch(err){

  return error(res, err.message, 500);

 }

};

exports.attendanceStats =
async (req,res)=>{

 try{

  const result =
  await pool.query(
   `
   SELECT
   COUNT(*) FILTER (WHERE check_in IS NOT NULL) AS present_days,
   COUNT(*) FILTER (WHERE check_out IS NULL AND check_in IS NOT NULL) AS missing_checkout
   FROM attendance
   `
  );

  return success(res, result.rows);

 }catch(err){

  return error(res, err.message, 500);

 }

};

exports.payrollStats =
async (req,res)=>{

 try{

  const result =
  await pool.query(
   `
   SELECT
   SUM(net_salary)
   AS total_salary_paid
   FROM payroll
   `
  );

  return success(res, result.rows[0]);

 }catch(err){

  return error(res, err.message, 500);

 }

};

exports.performanceStats =
async (req,res)=>{

 try{

  const result =
  await pool.query(
   `
   SELECT
   AVG(rating)
   AS average_rating
   FROM performance_reviews
   `
  );

  return success(res, result.rows[0]);

 }catch(err){

  return error(res, err.message, 500);

 }

};


exports.dashboardSummary =
async (req,res)=>{

 try{

  const cachedData =
  await getCache(
   "dashboard_summary"
  );

  if (cachedData) {
   return success(res, JSON.parse(cachedData));
  }

  const employees =
  await pool.query(
   `SELECT COUNT(*) FROM employees`
  );

  const candidates =
  await pool.query(
   `SELECT COUNT(*) FROM candidates`
  );

  const jobs =
  await pool.query(
   `
   SELECT COUNT(*)
   FROM job_posts
   WHERE status='OPEN'
   `
  );

  const data = {
   employees: Number(employees.rows[0].count),
   candidates: Number(candidates.rows[0].count),
   openJobs: Number(jobs.rows[0].count)
  };

  await setCache(
   "dashboard_summary",
   JSON.stringify(data),
   60
  );

  return success(res, data);

 }catch(err){

  return error(res, err.message, 500);

 }

};
