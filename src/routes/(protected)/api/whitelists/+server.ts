import { prisma } from '$lib/server/db/client';
import { hasPermission } from '$lib/server/utils';
import { AuthRoles } from '$lib/client/constants';
import { json } from '@sveltejs/kit';
import z from 'zod';
import type { RequestHandler } from './$types';

const WhitelistPostBody = z.object({
	email: z.email(),
	defaultRole: z.enum(AuthRoles).optional(),
});

export const POST: RequestHandler = async (event) => {
	if (!hasPermission(event.locals.user, ['admin'])) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const data = WhitelistPostBody.safeParse(await event.request.json());
	if (!data.success) {
		return json(
			{ message: 'Invalid request body', errors: data.error.issues },
			{ status: 400 },
		);
	}

	if (data.data.defaultRole === 'superadmin') {
		return json({ message: 'Cannot set default role to admin' }, { status: 400 });
	}

	const newWhitelist = await prisma.whitelist.create({
		data: {
			email: data.data.email,
			defaultRole: data.data.defaultRole,
		},
	});

	return json(newWhitelist);
};
