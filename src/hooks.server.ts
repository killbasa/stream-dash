import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
	const { route, request, locals } = event;

	if (route.id?.startsWith('/(protected)')) {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (session) {
			locals.session = session?.session;
			locals.user = session?.user;

			const url = new URL(request.url);
			if (url.pathname === '/') {
				redirect(307, '/blocks');
			}

			return svelteKitHandler({ event, resolve, auth, building });
		} else {
			redirect(307, '/login');
		}
	} else {
		return svelteKitHandler({ event, resolve, auth, building });
	}
};
