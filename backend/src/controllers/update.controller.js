const { PrismaClient } = require('@prisma/client');
const { computeFieldStatus } = require('../services/fieldStatus.service');

const prisma = new PrismaClient();

// @desc    Log a field update (Agent only)
// @route   POST /api/updates/field/:fieldId
const logUpdate = async (req, res) => {
  try {
    const { fieldId } = req.params;
    const { stage, notes, latitude, longitude } = req.body;

    // Verify field exists and agent is assigned
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
      select: { id: true, assignedAgentId: true, currentStage: true },
    });

    if (!field) {
      return res.status(404).json({ error: 'Field not found' });
    }

    // Agent can only update assigned fields
    if (req.user.role === 'AGENT' && field.assignedAgentId !== req.user.id) {
      return res.status(403).json({ error: 'You are not assigned to this field' });
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

    res.status(201).json({
      success: true,
      message: 'Field update logged successfully',
      data: {
        update,
        computedStatus: status,
      },
    });
  } catch (error) {
    console.error('Log update error:', error);
    res.status(500).json({ error: 'Failed to log update' });
  }
};

// @desc    Get all updates for a specific field
// @route   GET /api/updates/field/:fieldId
const getFieldUpdates = async (req, res) => {
  try {
    const { fieldId } = req.params;

    const field = await prisma.field.findUnique({
      where: { id: fieldId },
      select: { id: true, assignedAgentId: true },
    });

    if (!field) {
      return res.status(404).json({ error: 'Field not found' });
    }

    // Authorization
    if (req.user.role === 'AGENT' && field.assignedAgentId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
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
  } catch (error) {
    console.error('Get field updates error:', error);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
};

module.exports = {
  logUpdate,
  getFieldUpdates,
};