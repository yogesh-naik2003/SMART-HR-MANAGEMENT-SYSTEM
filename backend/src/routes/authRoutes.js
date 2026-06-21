const express = require("express");

const router = express.Router();

const authController =
require("../controllers/authController");

const authMiddleware =
require("../middleware/authMiddleware");
const roleMiddleware =
require("../middleware/roleMiddleware");

router.post(
  "/register",
  authController.register
);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register User
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: User registered successfully
 */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login User
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post(
  "/login",
  authController.login
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get Profile
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 */
router.get(
  "/profile",
  authMiddleware,
  (req, res) => {
    res.json({
      user: req.user
    });
  }
);

/**
 * @swagger
 * /api/auth/admin:
 *   get:
 *     summary: Admin Dashboard
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin access granted
 */
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware(1),
  (req, res) => {
    res.json({
      message: "Welcome Admin",
      user: req.user
    });
  }
);

module.exports = router;
