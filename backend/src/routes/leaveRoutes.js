const express =
require("express");

const router =
express.Router();

const leaveController =
require("../controllers/leaveController");
const authMiddleware =
require("../middleware/authMiddleware");
const roleMiddleware =
require("../middleware/roleMiddleware");

/**
 * @swagger
 * /api/leaves/apply:
 *   post:
 *     summary: Apply for Leave
 *     tags:
 *       - Leave
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Leave request created
 */
router.post(
 "/apply",
 authMiddleware,
 leaveController.applyLeave
);

/**
 * @swagger
 * /api/leaves/approve/{id}:
 *   put:
 *     summary: Approve Leave
 *     tags:
 *       - Leave
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
 *         description: Leave approved
 */
router.put(
 "/approve/:id",
 authMiddleware,
 roleMiddleware(1),
 leaveController.approveLeave
);

/**
 * @swagger
 * /api/leaves/reject/{id}:
 *   put:
 *     summary: Reject Leave
 *     tags:
 *       - Leave
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
 *         description: Leave rejected
 */
router.put(
 "/reject/:id",
 authMiddleware,
 roleMiddleware(1),
 leaveController.rejectLeave
);

/**
 * @swagger
 * /api/leaves:
 *   get:
 *     summary: Get Leave Requests
 *     tags:
 *       - Leave
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of leave requests
 */
router.get(
 "/",
 authMiddleware,
 leaveController.getLeaves
);

module.exports = router;
