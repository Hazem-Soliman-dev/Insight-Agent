const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Connecting to database...');
    const users = await prisma.user.findMany({
      include: {
        projects: {
          include: {
            tables: true
          }
        }
      }
    });
    console.log('Users in database:', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Database connection / query error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
