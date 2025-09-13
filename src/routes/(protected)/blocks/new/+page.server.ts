import { prisma } from '$lib/server/db/client';
import { auth } from '$src/lib/server/auth';
import { error, fail } from '@sveltejs/kit';
import z from 'zod';
import type { Actions, PageServerLoad } from './$types';
import type { LiveInput } from '$lib/server/db/generated/client';

export const load: PageServerLoad = async ({ request }) => {
	const hasPermission = await auth.api.userHasPermission({
		headers: request.headers,
		body: {
			permissions: {
				blocks: ['create'],
			},
		},
	});
	if (!hasPermission.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
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
		ingestLiveInputs: ingests,
		returnLiveInputs: playbacks,
		talents,
		locations,
	};
};

const CreateActionSchema = z.object({
	name: z.string().min(3),
	description: z.string().nullish(),
	start: z.coerce.number(),
	end: z.coerce.number(),
	talents: z.array(z.string()),
	ingestLiveInputId: z.string(),
	playbackLiveInputId: z.string(),
	locationId: z.string(),
});

export const actions: Actions = {
	create: async ({ request }) => {
		const hasPermission = await auth.api.userHasPermission({
			headers: request.headers,
			body: {
				permissions: {
					blocks: ['create'],
				},
			},
		});
		if (!hasPermission.success) {
			error(403, 'Forbidden: You do not have permission to access this resource.');
		}

		const formData = await request.formData();

		const data = CreateActionSchema.safeParse({
			name: formData.get('block_name'),
			description: formData.get('block_description'),
			start: formData.get('block_start'),
			end: formData.get('block_end'),
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

		const block = await prisma.block.create({
			data: {
				name: data.data.name,
				description: data.data.description,
				start: new Date(data.data.start),
				end: new Date(data.data.end),
				talents: {
					connect: data.data.talents.map((id) => ({ id })),
				},
				ingestLiveInputId: data.data.ingestLiveInputId,
				playbackLiveInputId: data.data.playbackLiveInputId,
				locationId: data.data.locationId,
			},
		});

		return { success: true, block };
	},
};
