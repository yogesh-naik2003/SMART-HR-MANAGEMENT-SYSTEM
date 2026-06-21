const pool = require("../config/db");
const { getCache, setCache, deleteCache } = require("../utils/cache");
const { success, error } = require("../utils/apiResponse");

exports.createNotification =
async (req,res)=>{

 try{

  const {
   user_id,
   title,
   message
  } = req.body || {};

  if (!user_id || !title || !message) {
   return error(res, "user_id, title and message are required", 400);
  }

  const result =
  await pool.query(

  `
  INSERT INTO notifications
  (
   user_id,
   title,
   message
  )
  VALUES
  ($1,$2,$3)
  RETURNING *
  `,

  [
   user_id,
   title,
   message
  ]

  );

  await deleteCache(`notifications_user_${user_id}`);

  return success(res, result.rows[0], 201);

 }catch(err){

  return error(res, err.message, 500);

 }

};

exports.getNotifications = async (req, res) => {
 try {
  const cacheKey = `notifications_user_${req.user.userId}`;
  const cachedData = await getCache(cacheKey);

  if (cachedData) {
   return success(res, JSON.parse(cachedData));
  }

  const result = await pool.query(
   `SELECT *
    FROM notifications
    WHERE user_id = $1
    ORDER BY id DESC`,
   [req.user.userId]
  );

  await setCache(cacheKey, JSON.stringify(result.rows), 30);

  return success(res, result.rows);
 } catch (err) {
  return error(res, err.message, 500);
 }
};

exports.markAsRead =
async (req,res)=>{

 try{

  const notificationId =
  req.params.id;

  const existingNotification = await pool.query(
   "SELECT id, user_id FROM notifications WHERE id = $1",
   [notificationId]
  );

  if (existingNotification.rows.length === 0) {
   return error(res, "Notification not found", 404);
  }

  if (existingNotification.rows[0].user_id !== req.user.userId) {
   return error(res, "Access Denied", 403);
  }

  const result =
  await pool.query(

  `
  UPDATE notifications
  SET is_read=TRUE
  WHERE id=$1
  RETURNING *
  `,

  [notificationId]

  );

  await deleteCache(`notifications_user_${req.user.userId}`);

  return success(res, result.rows[0]);

 }catch(err){

  return error(res, err.message, 500);

 }

};
