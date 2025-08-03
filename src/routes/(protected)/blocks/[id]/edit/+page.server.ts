import { prisma } from '$lib/server/db/client';
import { hasPermission } from '$lib/server/utils';
import { error, fail } from '@sveltejs/kit';
import z from 'zod';
import type { Actions, PageServerLoad } from './$types';
import type { LiveInput } from '$lib/server/db/generated/client';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!hasPermission(locals.user, ['editor', 'reader'], 'blocks')) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const block = await prisma.block.findUnique({
		where: { id: params.id },
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
	name: z.string().min(3),
	description: z.string().nullish(),
	start: z.number(),
	end: z.number(),
	talents: z.array(z.string()),
	ingestLiveInputId: z.string(),
	playbackLiveInputId: z.string(),
	locationId: z.string(),
});

export const actions: Actions = {
	update: async ({ request, locals, params }) => {
		if (!hasPermission(locals.user, ['editor'], 'blocks')) {
			error(403, 'Forbidden: You do not have permission to create blocks.');
		}

		const formData = await request.formData();

		const data = UpdateActionSchema.safeParse({
			name: formData.get('block_name')?.toString(),
			description: formData.get('block_description')?.toString(),
			start: Number(formData.get('block_start')),
			end: Number(formData.get('block_end')),
			talents: formData.getAll('block_talents').map((id) => id.toString()),
			ingestLiveInputId: formData.get('block_ingest')?.toString(),
			playbackLiveInputId: formData.get('block_return')?.toString(),
			locationId: formData.get('block_location')?.toString(),
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
