const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { success, error } = require('../utils/apiResponse');
const authMiddleware = require('../middleware/authMiddleware');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * /api/uploads/avatar:
 *   post:
 *     summary: Upload Avatar Image
 *     tags:
 *       - Uploads
 *     security:
 *       - bearerAuth: []
 */
router.post('/avatar', authMiddleware, upload.single('avatar'), (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'No file uploaded', 400);
    }
    return success(res, { url: `/uploads/${req.file.filename}` }, 'File uploaded successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
