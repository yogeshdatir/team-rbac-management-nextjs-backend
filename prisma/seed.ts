import { PrismaClient } from '@prisma/client';
import { Role, User } from '../app/api/types/index';
import { hashPassword } from '@/app/api/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create teams
  const sampleTeams = [
    {
      name: 'Engineering',
      description: 'Software development team',
      code: 'ENG-2026',
    },
    {
      name: 'Marketing',
      description: 'Marketing and sales team',
      code: 'MKT-2026',
    },
    {
      name: 'Operations',
      description: 'Business operations team',
      code: 'OPS-2026',
    },
  ];

  const createdTeams = [];
  for (const team of sampleTeams) {
    const createdTeam = await prisma.team.upsert({
      where: { code: team.code }, // ✅ unique field only
      update: {},
      create: team,
    });

    createdTeams.push(createdTeam);
  }

  const sampleUsers = [
    {
      name: 'Raj Desai',
      email: 'raj@company.com',
      teamId: createdTeams[0].id,
      role: Role.MANAGER,
    },
    {
      name: 'Sukesh Sai',
      email: 'sukesh@company.com',
      teamId: createdTeams[0].id,
      role: Role.USER,
    },
    {
      name: 'Dipika Katekar',
      email: 'dipika@company.com',
      teamId: createdTeams[1].id,
      role: Role.MANAGER,
    },
    {
      name: 'Sid Carrey',
      email: 'sid@company.com',
      teamId: createdTeams[1].id,
      role: Role.USER,
    },
  ];

  for (const user of sampleUsers) {
    await prisma.user.upsert({
      where: { email: user.email }, // ✅ unique field only
      update: {},
      create: {
        ...user,
        password: await hashPassword('123456'),
      },
    });
  }

  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
