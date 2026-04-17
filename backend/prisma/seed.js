// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  
  const adminPassword = await bcrypt.hash('admin123', salt);
  const agentPassword = await bcrypt.hash('agent123', salt);

  // Clean existing data (optional - comment out if you want to preserve data)
  // await prisma.fieldUpdate.deleteMany();
  // await prisma.field.deleteMany();
  // await prisma.user.deleteMany();

  // Upsert Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shamba.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@shamba.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+254700000000',
    },
  });

  // Upsert Agents
  const johnAgent = await prisma.user.upsert({
    where: { email: 'john@shamba.com' },
    update: {},
    create: {
      name: 'John Agent',
      email: 'john@shamba.com',
      password: agentPassword,
      role: 'AGENT',
      phone: '+254711111111',
    },
  });

  const maryAgent = await prisma.user.upsert({
    where: { email: 'mary@shamba.com' },
    update: {},
    create: {
      name: 'Mary Agent',
      email: 'mary@shamba.com',
      password: agentPassword,
      role: 'AGENT',
      phone: '+254722222222',
    },
  });

  // Create sample fields
  const field1 = await prisma.field.upsert({
    where: { id: 'field-nairobi-plot-a' },
    update: {},
    create: {
      id: 'field-nairobi-plot-a',
      name: 'Nairobi Plot A',
      cropType: 'Maize',
      plantingDate: new Date('2026-03-01'),
      currentStage: 'GROWING',
      assignedAgentId: johnAgent.id,
      createdById: admin.id,
      locationLat: -1.2921,
      locationLng: 36.8219,
    },
  });

  const field2 = await prisma.field.upsert({
    where: { id: 'field-kiambu-plot-b' },
    update: {},
    create: {
      id: 'field-kiambu-plot-b',
      name: 'Kiambu Plot B',
      cropType: 'Beans',
      plantingDate: new Date('2026-02-15'),
      currentStage: 'READY',
      assignedAgentId: maryAgent.id,
      createdById: admin.id,
      locationLat: -1.1821,
      locationLng: 36.9219,
    },
  });

  // Create sample updates
  await prisma.fieldUpdate.createMany({
    data: [
      {
        fieldId: field1.id,
        updatedById: johnAgent.id,
        stage: 'PLANTED',
        notes: 'Initial planting completed',
        latitude: -1.2921,
        longitude: 36.8219,
        createdAt: new Date('2026-03-01T10:00:00Z'),
      },
      {
        fieldId: field1.id,
        updatedById: johnAgent.id,
        stage: 'GROWING',
        notes: 'Germination good, some weeds present',
        latitude: -1.2922,
        longitude: 36.8220,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        fieldId: field2.id,
        updatedById: maryAgent.id,
        stage: 'PLANTED',
        notes: 'Beans planted',
        latitude: -1.1821,
        longitude: 36.9219,
        createdAt: new Date('2026-02-15T11:00:00Z'),
      },
      {
        fieldId: field2.id,
        updatedById: maryAgent.id,
        stage: 'GROWING',
        notes: 'Good growth',
        latitude: -1.1820,
        longitude: 36.9218,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      },
      {
        fieldId: field2.id,
        updatedById: maryAgent.id,
        stage: 'READY',
        notes: 'Ready for harvest soon',
        latitude: -1.1822,
        longitude: 36.9220,
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
      },
    ],
    skipDuplicates: true,
  });

  console.log('Database seeded successfully!');
  console.log('Admin login: admin@shamba.com / admin123');
  console.log('Agent login: john@shamba.com / agent123');
  console.log('Agent login: mary@shamba.com / agent123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });