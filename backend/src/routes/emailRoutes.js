const express =
require("express");

const router =
express.Router();

const emailController =
require("../controllers/emailController");

/**
 * @swagger
 * /api/email/test:
 *   post:
 *     summary: Send Test Email
 *     tags:
 *       - Email
 *     responses:
 *       200:
 *         description: Email sent successfully
 */
router.post(
 "/test",
 emailController.sendTestEmail
);

module.exports = router;
