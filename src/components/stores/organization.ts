import { setContext } from 'svelte';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { Organization } from '$src/lib/client/auth';

export const initOrganzationContext = (organizations: Organization[]): Writable<Organization[]> => {
	const store = writable<Organization[]>(organizations);

	setContext('organizations', store);

	return store;
};
