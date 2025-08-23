import type { Member, Session } from '$lib/client/auth';
import type { LiveInput } from 'cloudflare/resources/stream.mjs';

declare global {
	namespace App {
		interface Locals {
			session?: Session['session'];
			user?: Session['user'];
			member?: Member;
		}
		interface PageState {
			liveInput?: LiveInput;
		}
	}
}

export {};
