const express =
require("express");

const router =
express.Router();

const payrollController =
require("../controllers/payrollController");
const authMiddleware =
require("../middleware/authMiddleware");
const roleMiddleware =
require("../middleware/roleMiddleware");

/**
 * @swagger
 * /api/payroll/generate:
 *   post:
 *     summary: Generate Payroll
 *     tags:
 *       - Payroll
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Payroll generated
 */
router.post(
 "/generate",
 authMiddleware,
 roleMiddleware(1),
 payrollController.generatePayroll
);

/**
 * @swagger
 * /api/payroll:
 *   get:
 *     summary: Get Payroll Records
 *     tags:
 *       - Payroll
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payroll records
 */
router.get(
 "/",
 authMiddleware,
 payrollController.getPayrolls
);

router.get(
 "/download/:id",
 authMiddleware,
 payrollController.downloadPayslip
);

module.exports = router;
