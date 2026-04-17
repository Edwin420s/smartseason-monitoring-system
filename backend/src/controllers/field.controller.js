const { PrismaClient } = require('@prisma/client');
const { computeFieldStatus } = require('../services/fieldStatus.service');

const prisma = new PrismaClient();

// @desc    Create a new field (Admin only)
// @route   POST /api/fields
const createField = async (req, res) => {
  try {
    const { name, cropType, plantingDate, assignedAgentId, locationLat, locationLng } = req.body;

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

    res.status(201).json({
      success: true,
      data: field,
    });
  } catch (error) {
    console.error('Create field error:', error);
    res.status(500).json({ error: 'Failed to create field' });
  }
};

// @desc    Get all fields (Admin sees all, Agent sees only assigned)
// @route   GET /api/fields
const getFields = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Get fields error:', error);
    res.status(500).json({ error: 'Failed to fetch fields' });
  }
};

// @desc    Get a single field by ID
// @route   GET /api/fields/:id
const getFieldById = async (req, res) => {
  try {
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
      return res.status(404).json({ error: 'Field not found' });
    }

    // Authorization: agent can only view assigned fields
    if (req.user.role === 'AGENT' && field.assignedAgentId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const lastUpdate = field.updates.length > 0 ? field.updates[0].createdAt : field.createdAt;
    const status = computeFieldStatus(field.currentStage, lastUpdate);

    res.json({
      success: true,
      data: { ...field, status },
    });
  } catch (error) {
    console.error('Get field by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch field' });
  }
};

// @desc    Update field details (Admin only)
// @route   PUT /api/fields/:id
const updateField = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cropType, assignedAgentId, locationLat, locationLng } = req.body;

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
  } catch (error) {
    console.error('Update field error:', error);
    res.status(500).json({ error: 'Failed to update field' });
  }
};

// @desc    Delete a field (Admin only)
// @route   DELETE /api/fields/:id
const deleteField = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.field.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Field deleted successfully',
    });
  } catch (error) {
    console.error('Delete field error:', error);
    res.status(500).json({ error: 'Failed to delete field' });
  }
};

module.exports = {
  createField,
  getFields,
  getFieldById,
  updateField,
  deleteField,
};