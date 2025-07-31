import type { Session } from '$lib/client/auth';
import type { LiveInput } from 'cloudflare/resources/stream.mjs';

declare global {
	namespace App {
		interface Locals {
			session?: Session['session'];
			user?: Session['user'];
		}
		interface PageState {
			liveInput?: LiveInput;
		}
	}
}

export {};
