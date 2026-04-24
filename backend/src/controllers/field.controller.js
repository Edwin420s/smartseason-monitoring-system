const { PrismaClient } = require('@prisma/client');
const { computeFieldStatus } = require('../services/fieldStatus.service');
const logger = require('../utils/logger');
const { validate, validationSchemas } = require('../middleware/validation.middleware');
const { createError, ErrorTypes, asyncHandler } = require('../utils/errorHandler');

const prisma = new PrismaClient();

// @desc    Create a new field (Admin only)
// @route   POST /api/fields
const createField = asyncHandler(async (req, res) => {
  const { name, cropType, plantingDate, assignedAgentId, locationLat, locationLng } = req.body;

  // Validate input
  const validationErrors = validate({ name, cropType, plantingDate, assignedAgentId, locationLat, locationLng }, validationSchemas.createField);
  if (validationErrors.length > 0) {
    throw createError(ErrorTypes.VALIDATION_ERROR, 'Validation failed', validationErrors);
  }

  const field = await prisma.field.create({
    data: {
      name,
      cropType,
      plantingDate: new Date(plantingDate),
      assignedAgentId,
      createdById: req.user.id,
      currentStage: 'PLANTED',
      locationLat: locationLat ? parseFloat(locationLat) : null,
      locationLng: locationLng ? parseFloat(locationLng) : null,
    },
    include: {
      assignedAgent: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  // Log field creation
  logger.audit('FIELD_CREATED', req.user.id, {
    fieldId: field.id,
    fieldName: field.name,
    cropType: field.cropType,
    assignedAgentId: field.assignedAgentId
  });

  res.status(201).json({
    success: true,
    data: field,
  });
});

// @desc    Get all fields (Admin sees all, Agent sees only assigned)
// @route   GET /api/fields
const getFields = asyncHandler(async (req, res) => {
  let where = {};
  
  if (req.user.role === 'AGENT') {
    where.assignedAgentId = req.user.id;
  }

  const fields = await prisma.field.findMany({
    where,
    include: {
      assignedAgent: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
      updates: {
        orderBy: { createdAt: 'desc' },
        take: 1, // latest update for status calculation
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Compute status for each field
  const fieldsWithStatus = fields.map(field => {
    const lastUpdate = field.updates.length > 0 ? field.updates[0].createdAt : field.createdAt;
    const status = computeFieldStatus(field.currentStage, lastUpdate);
    return { ...field, status };
  });

  res.json({
    success: true,
    count: fieldsWithStatus.length,
    data: fieldsWithStatus,
  });
});

// @desc    Get a single field by ID
// @route   GET /api/fields/:id
const getFieldById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const field = await prisma.field.findUnique({
    where: { id },
    include: {
      assignedAgent: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
      updates: {
        orderBy: { createdAt: 'desc' },
        include: { updatedBy: { select: { id: true, name: true } } },
      },
    },
  });

  if (!field) {
    throw createError(ErrorTypes.FIELD_NOT_FOUND);
  }

  // Authorization: agent can only view assigned fields
  if (req.user.role === 'AGENT' && field.assignedAgentId !== req.user.id) {
    throw createError(ErrorTypes.FORBIDDEN);
  }

  const lastUpdate = field.updates.length > 0 ? field.updates[0].createdAt : field.createdAt;
  const status = computeFieldStatus(field.currentStage, lastUpdate);

  res.json({
    success: true,
    data: { ...field, status },
  });
});

// @desc    Update field details (Admin only)
// @route   PUT /api/fields/:id
const updateField = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, cropType, assignedAgentId, locationLat, locationLng } = req.body;

  // Validate input
  const validationErrors = validate({ name, cropType, assignedAgentId, locationLat, locationLng }, validationSchemas.updateField);
  if (validationErrors.length > 0) {
    throw createError(ErrorTypes.VALIDATION_ERROR, 'Validation failed', validationErrors);
  }

  const field = await prisma.field.update({
    where: { id },
    data: {
      name,
      cropType,
      assignedAgentId,
      locationLat: locationLat ? parseFloat(locationLat) : undefined,
      locationLng: locationLng ? parseFloat(locationLng) : undefined,
    },
    include: { assignedAgent: { select: { id: true, name: true } } },
  });

  res.json({
    success: true,
    data: field,
  });
});

// @desc    Delete a field (Admin only)
// @route   DELETE /api/fields/:id
const deleteField = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.field.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Field deleted successfully',
  });
});

module.exports = {
  createField,
  getFields,
  getFieldById,
  updateField,
  deleteField,
};