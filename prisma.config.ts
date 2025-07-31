import { defineConfig } from 'prisma/config';
import { join } from 'node:path';
import { loadEnvFile } from 'node:process';
import { existsSync } from 'node:fs';

if (existsSync('.env')) {
	loadEnvFile();
}

export default defineConfig({
	schema: join('prisma', 'schema'),
});
