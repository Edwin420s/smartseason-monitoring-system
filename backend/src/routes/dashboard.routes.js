const express = require('express');
const router = express.Router();
const { getAdminDashboard, getAgentDashboard } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/admin', authorize('ADMIN'), getAdminDashboard);
router.get('/agent', authorize('AGENT'), getAgentDashboard);

module.exports = router;