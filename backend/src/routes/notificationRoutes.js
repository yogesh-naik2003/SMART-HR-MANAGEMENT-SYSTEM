const express =
require("express");

const router =
express.Router();

const notificationController =
require("../controllers/notificationController");
const authMiddleware =
require("../middleware/authMiddleware");
const roleMiddleware =
require("../middleware/roleMiddleware");

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create Notification
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Notification created
 */
router.post(
 "/",
 authMiddleware,
 roleMiddleware(1),
 notificationController.createNotification
);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get My Notifications
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get(
 "/",
 authMiddleware,
 notificationController.getNotifications
);

/**
 * @swagger
 * /api/notifications/read/{id}:
 *   put:
 *     summary: Mark Notification as Read
 *     tags:
 *       - Notifications
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
 *         description: Notification updated
 */
router.put(
 "/read/:id",
 authMiddleware,
 notificationController.markAsRead
);

module.exports = router;
