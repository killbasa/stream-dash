import { PrismaClient } from './generated/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { env } from '$env/dynamic/private';

const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
