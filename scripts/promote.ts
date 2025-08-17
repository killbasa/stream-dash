import { PrismaClient } from '../src/lib/server/db/generated/client';
import { AuthInstanceRole, AuthInstanceRoles } from '../src/lib/client/constants';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadEnvFile } from 'node:process';

const email = process.argv[2];
if (!email) {
	console.error('Please provide an email address.');
	process.exit(1);
}

const role = process.argv[3];

if (!Object.values(AuthInstanceRoles).includes(role as AuthInstanceRole)) {
	console.error('Invalid role. Use "superadmin", "admin", or "user".');
	process.exit(1);
}

loadEnvFile();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const existing = await prisma.user.findUnique({
	where: { email },
});

if (!existing) {
	console.log(`${email} is not a registered user`);
	process.exit(0);
}

if (existing.role === role) {
	console.log(`${email} is already a ${role}`);
	process.exit(0);
}

await prisma.user.update({
	where: { email },
	data: {
		email,
		role: role,
	},
});

console.log(`Updated ${email}'s role to ${role}`);
process.exit(0);
