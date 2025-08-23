<script lang="ts">
	import { authClient } from '$src/lib/client/auth';
	import { Select } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const orgs = authClient.useListOrganizations();
	const activeOrg = authClient.useActiveOrganization();

	let selectedOrgId = $derived<string | null>($activeOrg.data?.id ?? null);
</script>

<Select
	class="w-full"
	placeholder="Select an organization"
	value={selectedOrgId}
	onchange={async (event) => {
		if (event.currentTarget.value === '') return;

		console.log('Organization selected:', event.currentTarget.value);

		const org = $orgs.data?.find((o) => o.id === event.currentTarget.value);
		if (!org) {
			console.log('Organization not found');
			return;
		}

		if ($activeOrg.data?.id === org.id) {
			return;
		}

		const oldSlug = $activeOrg.data?.slug;
		const { data, error } = await authClient.organization.setActive({
			organizationId: org.id,
			organizationSlug: org.slug,
		});

		if (error) {
			console.log('Error setting active organization:', error);
			selectedOrgId = null;
			return;
		}

		console.log('Active organization set to:', data.name);
		selectedOrgId = data.id;

		if (oldSlug) {
			// TODO - needs more validation
			await goto(page.url.pathname.replace(oldSlug, org.slug));
		}
	}}
>
	{#each $orgs.data ?? [] as org}
		<option value={org.id}>{org.name}</option>
	{/each}
</Select>
