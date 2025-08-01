import { prisma } from '$lib/server/db/client';
import { json } from '@sveltejs/kit';
import z from 'zod';
import type { RequestHandler } from './$types';

const WhitelistPostBody = z.object({
	email: z.string().email(),
	defaultRole: z.enum(['admin', 'editor', 'reader']).optional(),
});

export const POST: RequestHandler = async (event) => {
	if (event.locals.user?.role !== 'admin') {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const data = WhitelistPostBody.safeParse(await event.request.json());
	if (!data.success) {
		return json(
			{ message: 'Invalid request body', errors: data.error.issues },
			{ status: 400 },
		);
	}

	const newWhitelist = await prisma.whitelist.create({
		data: {
			email: data.data.email,
			defaultRole: data.data.defaultRole,
		},
	});

	return json(newWhitelist);
};
