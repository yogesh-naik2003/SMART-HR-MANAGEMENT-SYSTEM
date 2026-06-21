const pool = require("../config/db");
const { getCache, setCache } = require("../utils/cache");
const { success, error } = require("../utils/apiResponse");

exports.getAuditLogs =
async (req,res)=>{

 try{

  const cachedData = await getCache("audit_logs");
  if (cachedData) {
   return success(res, JSON.parse(cachedData));
  }

  const result =
  await pool.query(
   `
   SELECT
   al.*,
   u.name
   FROM audit_logs al
   LEFT JOIN users u
   ON al.user_id=u.id
   ORDER BY al.created_at DESC
   `
  );

  await setCache("audit_logs", JSON.stringify(result.rows), 30);
  return success(res, result.rows);

 }catch(err){

  return error(res, err.message, 500);

 }

};
