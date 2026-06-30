import { PrismaClient } from '@/generated/prisma/client';

// Prisma v7 requires explicit options, but for SQLite with prisma.config.ts
// the datasource URL is configured via the config file
const prismaClientSingleton = () => {
  // @ts-expect-error - Prisma v7 SQLite doesn't require adapter but TypeScript insists on it
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
