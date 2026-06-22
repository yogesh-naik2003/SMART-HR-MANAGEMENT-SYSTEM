const express =
require("express");

const router =
express.Router();

const analyticsController =
require("../controllers/analyticsController");
const authMiddleware =
require("../middleware/authMiddleware");
const roleMiddleware =
require("../middleware/roleMiddleware");

/**
 * @swagger
 * /api/analytics/employees:
 *   get:
 *     summary: Employee Count
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 */
router.get(
 "/employees",
 authMiddleware,
 roleMiddleware(1),
 analyticsController.totalEmployees
);

/**
 * @swagger
 * /api/analytics/departments:
 *   get:
 *     summary: Department Count
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 */
router.get(
 "/departments",
 authMiddleware,
 roleMiddleware(1),
 analyticsController.totalDepartments
);

/**
 * @swagger
 * /api/analytics/candidates:
 *   get:
 *     summary: Candidate Count
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 */
router.get(
 "/candidates",
 authMiddleware,
 roleMiddleware(1),
 analyticsController.totalCandidates
);

/**
 * @swagger
 * /api/analytics/jobs:
 *   get:
 *     summary: Open Job Count
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 */
router.get(
 "/jobs",
 authMiddleware,
 roleMiddleware(1),
 analyticsController.totalOpenJobs
);

/**
 * @swagger
 * /api/analytics/attendance:
 *   get:
 *     summary: Attendance Stats
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 */
router.get(
 "/attendance",
 authMiddleware,
 roleMiddleware(1),
 analyticsController.attendanceStats
);

/**
 * @swagger
 * /api/analytics/payroll:
 *   get:
 *     summary: Payroll Stats
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 */
router.get(
 "/payroll",
 authMiddleware,
 roleMiddleware(1),
 analyticsController.payrollStats
);

/**
 * @swagger
 * /api/analytics/performance:
 *   get:
 *     summary: Performance Stats
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 */
router.get(
 "/performance",
 authMiddleware,
 roleMiddleware(1),
 analyticsController.performanceStats
);

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Dashboard Summary
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 */
router.get(
 "/dashboard",
 authMiddleware,
 roleMiddleware(1, 2, 3, 4),
 analyticsController.dashboardSummary
);

module.exports = router;
