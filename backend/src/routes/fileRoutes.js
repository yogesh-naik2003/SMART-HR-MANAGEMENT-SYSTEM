const express =
require("express");

const router =
express.Router();

const upload =
require("../config/multer");

const fileController =
require("../controllers/fileController");
const authMiddleware =
require("../middleware/authMiddleware");
const roleMiddleware =
require("../middleware/roleMiddleware");

/**
 * @swagger
 * /api/files/employee-document:
 *   post:
 *     summary: Upload Employee Document
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Document uploaded
 */
router.post(
 "/employee-document",
 authMiddleware,
 roleMiddleware(1),
 upload.single("document"),
 fileController.uploadEmployeeDocument
);

/**
 * @swagger
 * /api/files/employee-document/{employeeId}:
 *   get:
 *     summary: Get Employee Documents
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Document list
 */
router.get(
 "/employee-document/:employeeId",
 authMiddleware,
 roleMiddleware(1),
 fileController.getEmployeeDocuments
);

/**
 * @swagger
 * /api/files/employee-document/{id}:
 *   delete:
 *     summary: Delete Employee Document
 *     tags:
 *       - Files
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
 *         description: Document deleted
 */
router.delete(
 "/employee-document/:id",
 authMiddleware,
 roleMiddleware(1),
 fileController.deleteEmployeeDocument
);

module.exports = router;
