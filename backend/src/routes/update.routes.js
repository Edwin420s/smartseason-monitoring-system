const express = require('express');
const router = express.Router();
const { logUpdate, getFieldUpdates } = require('../controllers/update.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// All routes require authentication
router.use(protect);

// Field update routes
router.post('/field/:fieldId', upload.single('image'), logUpdate);
router.get('/field/:fieldId', getFieldUpdates);

module.exports = router;