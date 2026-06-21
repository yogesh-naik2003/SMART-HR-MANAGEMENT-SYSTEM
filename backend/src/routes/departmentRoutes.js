const express = require("express");

const router = express.Router();

const departmentController =
require("../controllers/departmentController");

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get All Departments
 *     tags:
 *       - Departments
 *     responses:
 *       200:
 *         description: List of departments
 */
router.get(
  "/",
  departmentController.getDepartments
);

module.exports = router;
