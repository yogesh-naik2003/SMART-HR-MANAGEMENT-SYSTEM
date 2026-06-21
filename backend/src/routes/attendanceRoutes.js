const express = require("express");

const router = express.Router();

const attendanceController =
require("../controllers/attendanceController");
const authMiddleware =
require("../middleware/authMiddleware");

/**
 * @swagger
 * /api/attendance/check-in:
 *   post:
 *     summary: Check In Employee
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Attendance marked
 */
router.post(
  "/check-in",
  authMiddleware,
  attendanceController.checkIn
);

/**
 * @swagger
 * /api/attendance/check-out:
 *   post:
 *     summary: Check Out Employee
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Check out recorded
 */
router.post(
  "/check-out",
  authMiddleware,
  attendanceController.checkOut
);

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get Attendance Records
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records
 */
router.get(
  "/summary",
  authMiddleware,
  attendanceController.getSummary
);

router.get(
  "/",
  authMiddleware,
  attendanceController.getAttendance
);

module.exports = router;
