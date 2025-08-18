import { prisma } from './db/client';

export const getOrgIdFromSlug = async (slug: string): Promise<string | null> => {
	const org = await prisma.organization.findUnique({
		where: { slug },
		select: { id: true },
	});

	return org?.id ?? null;
};
