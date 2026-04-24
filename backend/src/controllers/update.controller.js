const { PrismaClient } = require('@prisma/client');
const { computeFieldStatus } = require('../services/fieldStatus.service');
const logger = require('../utils/logger');
const { validate, validationSchemas } = require('../middleware/validation.middleware');
const { createError, ErrorTypes, asyncHandler } = require('../utils/errorHandler');

const prisma = new PrismaClient();

// @desc    Log a field update (Agent only)
// @route   POST /api/updates/field/:fieldId
const logUpdate = asyncHandler(async (req, res) => {
  const { fieldId } = req.params;
  const { stage, notes, latitude, longitude } = req.body;

  // Validate input
  const validationErrors = validate({ stage, notes, latitude, longitude }, validationSchemas.submitUpdate);
  if (validationErrors.length > 0) {
    throw createError(ErrorTypes.VALIDATION_ERROR, 'Validation failed', validationErrors);
  }

  // Verify field exists and agent is assigned
  const field = await prisma.field.findUnique({
    where: { id: fieldId },
    select: { id: true, assignedAgentId: true, currentStage: true },
  });

  if (!field) {
    throw createError(ErrorTypes.FIELD_NOT_FOUND);
  }

  // Agent can only update assigned fields
  if (req.user.role === 'AGENT' && field.assignedAgentId !== req.user.id) {
    throw createError(ErrorTypes.FORBIDDEN, 'You are not assigned to this field');
  }

  // Get image URL from Cloudinary or local upload
  let imageUrl = null;
  if (req.file) {
    if (req.file.path) {
      // Cloudinary returns a `path` property with the secure URL
      imageUrl = req.file.path;
    } else {
      // Local storage: construct URL (adjust host in production)
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }
  }

  // Create the update record
  const update = await prisma.fieldUpdate.create({
    data: {
      fieldId,
      updatedById: req.user.id,
      stage,
      notes,
      imageUrl,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
    },
  });

  // Update field's current stage
  await prisma.field.update({
    where: { id: fieldId },
    data: { currentStage: stage },
  });

  // Compute new status
  const status = computeFieldStatus(stage, update.createdAt);

  // Log field update
  logger.audit('FIELD_UPDATE', req.user.id, {
    fieldId,
    updateId: update.id,
    stage,
    hasImage: !!imageUrl,
    hasLocation: !!(latitude && longitude),
    latitude,
    longitude
  });

  res.status(201).json({
    success: true,
    message: 'Field update logged successfully',
    data: {
      update,
      computedStatus: status,
    },
  });
});

// @desc    Get all updates for a specific field
// @route   GET /api/updates/field/:fieldId
const getFieldUpdates = asyncHandler(async (req, res) => {
  const { fieldId } = req.params;

  const field = await prisma.field.findUnique({
    where: { id: fieldId },
    select: { id: true, assignedAgentId: true },
  });

  if (!field) {
    throw createError(ErrorTypes.FIELD_NOT_FOUND);
  }

  // Authorization
  if (req.user.role === 'AGENT' && field.assignedAgentId !== req.user.id) {
    throw createError(ErrorTypes.FORBIDDEN);
  }

  const updates = await prisma.fieldUpdate.findMany({
    where: { fieldId },
    include: {
      updatedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    count: updates.length,
    data: updates,
  });
});

module.exports = {
  logUpdate,
  getFieldUpdates,
};