// server/routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const imageController = require('../controllers/imageController');

// נתיב להעלאת תמונה ושליחה ל-Gemini
router.post('/predict', upload.single('image'), imageController.predictImage);

module.exports = router;
