const { PrismaClient } = require('@prisma/client');
const { computeFieldStatus } = require('../services/fieldStatus.service');

const prisma = new PrismaClient();

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
const getAdminDashboard = async (req, res) => {
  try {
    // Fetch all fields with latest update
    const fields = await prisma.field.findMany({
      include: {
        assignedAgent: { select: { id: true, name: true } },
        updates: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    // Compute status for each field
    const fieldsWithStatus = fields.map(field => {
      const lastUpdate = field.updates.length > 0 ? field.updates[0].createdAt : field.createdAt;
      const status = computeFieldStatus(field.currentStage, lastUpdate);
      return { ...field, status };
    });

    const totalFields = fieldsWithStatus.length;
    const activeFields = fieldsWithStatus.filter(f => f.status === 'Active').length;
    const atRiskFields = fieldsWithStatus.filter(f => f.status === 'At Risk').length;
    const completedFields = fieldsWithStatus.filter(f => f.status === 'Completed').length;

    // Fields per stage
    const fieldsByStage = {
      PLANTED: fields.filter(f => f.currentStage === 'PLANTED').length,
      GROWING: fields.filter(f => f.currentStage === 'GROWING').length,
      READY: fields.filter(f => f.currentStage === 'READY').length,
      HARVESTED: fields.filter(f => f.currentStage === 'HARVESTED').length,
    };

    // Recent updates (last 5 across all fields)
    const recentUpdates = await prisma.fieldUpdate.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        field: { select: { name: true } },
        updatedBy: { select: { name: true } },
      },
    });

    // Agents summary
    const agentSummary = await prisma.user.findMany({
      where: { role: 'AGENT' },
      select: {
        id: true,
        name: true,
        _count: { select: { assignedFields: true } },
      },
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalFields,
          activeFields,
          atRiskFields,
          completedFields,
        },
        fieldsByStage,
        recentUpdates,
        agentSummary,
        fields: fieldsWithStatus, // full list for table
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// @desc    Get agent dashboard stats
// @route   GET /api/dashboard/agent
const getAgentDashboard = async (req, res) => {
  try {
    const agentId = req.user.id;

    const fields = await prisma.field.findMany({
      where: { assignedAgentId: agentId },
      include: {
        updates: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    const fieldsWithStatus = fields.map(field => {
      const lastUpdate = field.updates.length > 0 ? field.updates[0].createdAt : field.createdAt;
      const status = computeFieldStatus(field.currentStage, lastUpdate);
      return { ...field, status };
    });

    const totalAssigned = fieldsWithStatus.length;
    const active = fieldsWithStatus.filter(f => f.status === 'Active').length;
    const atRisk = fieldsWithStatus.filter(f => f.status === 'At Risk').length;
    const completed = fieldsWithStatus.filter(f => f.status === 'Completed').length;

    // Fields needing attention (At Risk)
    const needsAttention = fieldsWithStatus.filter(f => f.status === 'At Risk');

    res.json({
      success: true,
      data: {
        summary: {
          totalAssigned,
          active,
          atRisk,
          completed,
        },
        needsAttention,
        fields: fieldsWithStatus,
      },
    });
  } catch (error) {
    console.error('Agent dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

module.exports = {
  getAdminDashboard,
  getAgentDashboard,
};