const express = require('express');
const router = express.Router();
const { getAgents } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// All routes require authentication
router.use(protect);

// Get all agents (Admin only)
router.get('/agents', authorize('ADMIN'), getAgents);

module.exports = router;
