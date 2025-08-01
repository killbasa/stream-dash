import { PrismaClient } from '../src/lib/server/db/generated/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { loadEnvFile } from 'node:process';

const email = process.argv[2];
if (!email) {
	console.error('Please provide an email address.');
	process.exit(1);
}

const role = process.argv[3];

if (!['admin', 'editor', 'reader'].includes(role)) {
	console.error('Invalid role. Use "admin", "editor", or "reader".');
	process.exit(1);
}

loadEnvFile();

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });

const existing = await prisma.whitelist.findUnique({
	where: { email },
});

if (existing) {
	console.log(`${email} is already whitelisted`);
	process.exit(0);
}

await prisma.whitelist.create({
	data: {
		email,
		defaultRole: role,
	},
});

console.log(`Whitelisted ${email}`);
