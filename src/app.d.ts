import type { LiveInput } from 'cloudflare/resources/stream.mjs';

declare global {
	namespace App {
		interface Locals {
			session?: Session;
			user?: User;
		}
		interface PageState {
			liveInput?: LiveInput;
		}
	}
}

export {};
