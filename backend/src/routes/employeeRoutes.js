const express = require("express");

const router = express.Router();

const employeeController = require("../controllers/employeeController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create Employee
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Employee created successfully
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(1),
  employeeController.createEmployee
);

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get All Employees
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of employees
 */
router.get(
  "/",
  authMiddleware,
  employeeController.getEmployees
);

router.get(
  "/:id",
  authMiddleware,
  employeeController.getEmployeeProfile
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(1),
  employeeController.updateEmployee
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(1),
  employeeController.deleteEmployee
);

module.exports = router;
