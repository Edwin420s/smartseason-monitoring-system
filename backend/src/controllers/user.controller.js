const { PrismaClient } = require('@prisma/client');
const { createError, ErrorTypes, asyncHandler } = require('../utils/errorHandler');

const prisma = new PrismaClient();

// @desc    Get all agents (Admin only)
// @route   GET /api/users/agents
const getAgents = asyncHandler(async (req, res) => {
  const agents = await prisma.user.findMany({
    where: { role: 'AGENT' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: {
        select: { assignedFields: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  res.json({
    success: true,
    count: agents.length,
    data: agents,
  });
});

module.exports = { getAgents };
