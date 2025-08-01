import { prisma } from '$lib/server/db/client';
import { json } from '@sveltejs/kit';
import z from 'zod';
import type { RequestHandler } from './$types';

const UserPutBody = z.object({
	id: z.string(),
	role: z.enum(['admin', 'editor', 'reader']).optional(),
	scopes: z.array(z.enum(['live-inputs', 'wizard'])).optional(),
});

export const PUT: RequestHandler = async (event) => {
	if (event.locals.user?.role !== 'admin') {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const data = UserPutBody.safeParse(await event.request.json());
	if (!data.success) {
		return json(
			{ message: 'Invalid request body', errors: data.error.issues },
			{ status: 400 },
		);
	}

	const user = await prisma.user.findUnique({
		where: {
			id: data.data.id,
		},
		select: {
			id: true,
			role: true,
		},
	});
	if (!user) {
		return json({ message: 'User not found' }, { status: 404 });
	}

	if (data.data.role !== undefined) {
		if (user.role === 'admin' && data.data.role !== 'admin') {
			return json({ message: 'Cannot demote admins through the dashboard' }, { status: 400 });
		}

		if (user.id === event.locals.user?.id && data.data.role !== user.role) {
			return json({ message: 'Cannot change your own role' }, { status: 400 });
		}
	}

	const newUser = await prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			role: data.data.role,
			scopes: data.data.scopes,
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			scopes: true,
		},
	});

	return json(newUser);
};

export const DELETE: RequestHandler = async (event) => {
	if (event.locals.user?.role !== 'admin') {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const userId = event.params.id;
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, role: true },
	});

	if (!user) {
		return json({ message: 'User not found' }, { status: 404 });
	}

	if (user.role === 'admin') {
		return json({ message: 'Cannot delete admin users' }, { status: 400 });
	}

	await prisma.user.delete({
		where: { id: userId },
	});

	return json({ message: 'User deleted successfully' });
};
