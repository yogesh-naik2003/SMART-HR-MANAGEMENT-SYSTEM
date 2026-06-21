const pool = require("../config/db");

async function createEmailLog({
  userId = null,
  type,
  subject,
  recipient,
  status,
  errorMessage = null,
  entityType = null,
  entityId = null
}) {
  try {
    const result = await pool.query(
      `INSERT INTO email_logs
       (
         user_id,
         type,
         subject,
         recipient,
         status,
         error_message,
         entity_type,
         entity_id
       )
       VALUES
       ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id`,
      [
        userId,
        type,
        subject,
        recipient,
        status,
        errorMessage,
        entityType,
        entityId
      ]
    );

    return result;
  } catch (error) {
    console.error("Email Log Error:", error.message);
    return null;
  }
}

async function updateEmailLogStatus(id, status, errorMessage = null) {
  if (!id) {
    return;
  }

  try {
    await pool.query(
      `UPDATE email_logs
       SET status = $2,
           error_message = $3,
           sent_at = CASE WHEN $2 = 'SENT' THEN NOW() ELSE sent_at END
       WHERE id = $1`,
      [id, status, errorMessage]
    );
  } catch (error) {
    console.error("Email Log Update Error:", error.message);
  }
}

module.exports = {
  createEmailLog,
  updateEmailLogStatus
};
