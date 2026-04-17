const express = require('express');
const router = express.Router();
const {
  createField,
  getFields,
  getFieldById,
  updateField,
  deleteField,
} = require('../controllers/field.controller');
const { getAgents } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .post(authorize('ADMIN'), createField)
  .get(getFields);

router.route('/:id')
  .get(getFieldById)
  .put(authorize('ADMIN'), updateField)
  .delete(authorize('ADMIN'), deleteField);

module.exports = router;