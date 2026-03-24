import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function connectToDatabase() {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}
