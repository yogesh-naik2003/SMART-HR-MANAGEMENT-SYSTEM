const pool = require("../config/db");

const createAuditLog = async (
  userId,
  action,
  entityType,
  entityId,
  details
) => {

  try {

    await pool.query(
      `
      INSERT INTO audit_logs
      (
        user_id,
        action,
        entity_type,
        entity_id,
        details
      )
      VALUES
      ($1,$2,$3,$4,$5)
      `,
      [
        userId,
        action,
        entityType,
        entityId,
        details
      ]
    );

  } catch (error) {

    console.error(
      "Audit Log Error:",
      error.message
    );

  }

};

module.exports = createAuditLog;