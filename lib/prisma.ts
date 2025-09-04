import { PrismaClient } from '@prisma/client';

// Global declaration for Prisma Client to avoid multiple instances in dev mode
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: ['query'], // Optional, logs SQL queries
});

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
