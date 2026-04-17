const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// @desc    Get all agents (Admin only)
// @route   GET /api/users/agents
const getAgents = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
};

module.exports = { getAgents };
