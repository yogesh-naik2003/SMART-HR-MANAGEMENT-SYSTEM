const express = require("express");

const router = express.Router();

const performanceController =
require("../controllers/performanceController");
const authMiddleware =
require("../middleware/authMiddleware");
const roleMiddleware =
require("../middleware/roleMiddleware");

/**
 * @swagger
 * /api/performance/goals:
 *   post:
 *     summary: Create Goal
 *     tags:
 *       - Performance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Goal created
 */
router.get(
 "/goals",
 authMiddleware,
 performanceController.getGoals
);

router.post(
 "/goals",
 authMiddleware,
 roleMiddleware(1),
 performanceController.createGoal
);

/**
 * @swagger
 * /api/performance/assign:
 *   post:
 *     summary: Assign Goal
 *     tags:
 *       - Performance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Goal assigned
 */
router.post(
 "/assign",
 authMiddleware,
 roleMiddleware(1),
 performanceController.assignGoal
);

/**
 * @swagger
 * /api/performance/progress/{id}:
 *   put:
 *     summary: Update Goal Progress
 *     tags:
 *       - Performance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Progress updated
 */
router.put(
 "/progress/:id",
 authMiddleware,
 performanceController.updateProgress
);

/**
 * @swagger
 * /api/performance/review:
 *   post:
 *     summary: Add Performance Review
 *     tags:
 *       - Performance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Review added
 */
router.get(
 "/reviews",
 authMiddleware,
 performanceController.getReviews
);

router.post(
 "/review",
 authMiddleware,
 roleMiddleware(1),
 performanceController.addReview
);

module.exports = router;
