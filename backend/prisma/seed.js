// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  
  const adminPassword = await bcrypt.hash('Admin123!', salt);
  const agentPassword = await bcrypt.hash('Agent123!', salt);

  // Upsert Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shamba.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@shamba.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+254700000000',
    },
  });

  // Upsert Agent
  const agent = await prisma.user.upsert({
    where: { email: 'agent@shamba.com' },
    update: {},
    create: {
      name: 'John Field Agent',
      email: 'agent@shamba.com',
      password: agentPassword,
      role: 'AGENT',
      phone: '+254711111111',
    },
  });

  console.log('Seeded users:', { admin: admin.email, agent: agent.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });