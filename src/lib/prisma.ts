import 'dotenv/config';
import { PrismaClient } from '../../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL or DIRECT_URL environment variable');
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
