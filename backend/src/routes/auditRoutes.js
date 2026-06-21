const express =
require("express");

const router =
express.Router();

const auditController =
require("../controllers/auditController");
const authMiddleware =
require("../middleware/authMiddleware");
const roleMiddleware =
require("../middleware/roleMiddleware");

/**
 * @swagger
 * /api/audit:
 *   get:
 *     summary: Get Audit Logs
 *     tags:
 *       - Audit
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit log list
 */
router.get(
 "/",
 authMiddleware,
 roleMiddleware(1),
 auditController.getAuditLogs
);

module.exports = router;
