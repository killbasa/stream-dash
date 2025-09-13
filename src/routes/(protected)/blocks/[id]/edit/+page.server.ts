import { prisma } from '$lib/server/db/client';
import { auth } from '$src/lib/server/auth';
import { error, fail } from '@sveltejs/kit';
import z from 'zod';
import type { Actions, PageServerLoad } from './$types';
import type { LiveInput } from '$lib/server/db/generated/client';

export const load: PageServerLoad = async ({ request, params }) => {
	const hasPermission = await auth.api.userHasPermission({
		headers: request.headers,
		body: {
			permissions: {
				blocks: ['update'],
			},
		},
	});
	if (!hasPermission.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const block = await prisma.block.findUnique({
		where: {
			id: params.id,
		},
		include: {
			talents: true,
		},
	});

	if (!block) {
		error(404, 'Block not found');
	}

	const [liveInputs, talents, locations] = await prisma.$transaction([
		prisma.liveInput.findMany(),
		prisma.talent.findMany(),
		prisma.location.findMany(),
	]);

	const ingests: LiveInput[] = [];
	const playbacks: LiveInput[] = [];
	for (const input of liveInputs) {
		if (input.type === 'ingest') {
			ingests.push(input);
		} else if (input.type === 'return') {
			playbacks.push(input);
		}
	}

	return {
		block,
		ingestLiveInputs: ingests,
		returnLiveInputs: playbacks,
		talents,
		locations,
	};
};

const UpdateActionSchema = z.object({
	name: z.string().min(3).optional(),
	description: z.string().nullish().optional(),
	start: z.coerce.number().optional(),
	end: z.coerce.number().optional(),
	talents: z.array(z.string()),
	ingestLiveInputId: z.string().optional(),
	playbackLiveInputId: z.string().optional(),
	locationId: z.string().optional(),
});

export const actions: Actions = {
	update: async ({ request, params }) => {
		const hasPermission = await auth.api.userHasPermission({
			headers: request.headers,
			body: {
				permissions: {
					blocks: ['update'],
				},
			},
		});
		if (!hasPermission.success) {
			error(403, 'Forbidden: You do not have permission to access this resource.');
		}

		const formData = await request.formData();

		const data = UpdateActionSchema.safeParse({
			name: formData.get('block_name'),
			description: formData.get('block_description'),
			start: formData.get('block_start') ?? undefined,
			end: formData.get('block_end') ?? undefined,
			talents: formData.getAll('block_talents'),
			ingestLiveInputId: formData.get('block_ingest'),
			playbackLiveInputId: formData.get('block_return'),
			locationId: formData.get('block_location'),
		});

		if (!data.success) {
			return fail(400, {
				errors: data.error.issues.map((issue) => ({
					path: issue.path,
					message: issue.message,
				})),
			});
		}

		const block = await prisma.block.update({
			where: {
				id: params.id,
			},
			data: {
				name: data.data.name,
				description: data.data.description,
				start: data.data.start ? new Date(data.data.start) : undefined,
				end: data.data.end ? new Date(data.data.end) : undefined,
				talents: {
					set: data.data.talents.map((talentId) => ({ id: talentId })),
				},
				ingestLiveInputId: data.data.ingestLiveInputId,
				playbackLiveInputId: data.data.playbackLiveInputId,
				locationId: data.data.locationId,
			},
		});

		return { success: true, block };
	},
};
