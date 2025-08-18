<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import { authClient } from '$src/lib/client/auth';
	import { debounce } from '$src/lib/client/utils';
	import { Alert, Button, Card, Fileupload, Helper, Input, Label } from 'flowbite-svelte';
	import InfoCircleSolid from 'flowbite-svelte-icons/InfoCircleSolid.svelte';
	import type { SubmitFunction } from './$types';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let errorNotif = $state<string>();
	let slugErrorNotif = $state<string>();
	let slugSuccessNotif = $state<string>();
	let newSlug = $state<string>();

	const checkSlug = debounce(async (): Promise<void> => {
		if (!newSlug) {
			slugErrorNotif = undefined;
			slugSuccessNotif = undefined;
			return;
		}

		const { data, error } = await authClient.organization.checkSlug({
			slug: newSlug,
		});

		if (error) {
			errorNotif = error.message;
			return;
		}

		if (data.status) {
			slugErrorNotif = undefined;
			slugSuccessNotif = 'Slug is available!';
		} else {
			slugErrorNotif = 'Slug is already taken.';
			slugSuccessNotif = undefined;
		}
	}, 250);

	const handleCreate: SubmitFunction = () => {
		return async function ({ result }) {
			if (result.type === 'failure') {
				console.error('Failed to create organization:', result.data?.message);
				slugErrorNotif = 'Failed to create organization';
				return;
			}

			if (result.type === 'error') {
				console.error('Error creating organization:', result.error);
				slugErrorNotif = 'Error creating organization';
				return;
			}

			await goto('/admin/organizations');
		};
	};
</script>

<svelte:head>
	<title>Create a new organization | Admin</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Create a new organization</h1>

	{#if errorNotif}
		<Alert color="red" dismissable onclick={() => (errorNotif = undefined)}>
			{#snippet icon()}<InfoCircleSolid class="h-5 w-5" />{/snippet}
			{errorNotif}
		</Alert>
	{/if}

	<form method="POST" action="?/create" enctype="multipart/form-data" use:enhance={handleCreate}>
		<Card class="p-4 gap-4" size="xl">
			<div>
				<Label for="org_name" class="mb-1">Name</Label>
				<Input
					id="org_name"
					name="org_name"
					type="text"
					placeholder="Enter organization name"
					required
					autocomplete="off"
				/>
			</div>

			<div>
				<Label for="org_slug" class="mb-1">Slug</Label>
				<Input
					id="org_slug"
					name="org_slug"
					type="text"
					placeholder="Enter organization slug"
					oninput={checkSlug}
					bind:value={newSlug}
					required
					autocomplete="off"
				/>
				{#if slugErrorNotif}
					<Helper class="mt-2" color="red">
						<span class="font-medium">{slugErrorNotif}</span>
					</Helper>
				{/if}
				{#if slugSuccessNotif}
					<Helper class="mt-2" color="green">
						<span class="font-medium">{slugSuccessNotif}</span>
					</Helper>
				{/if}
			</div>

			<div>
				<Label for="org_logo" class="mb-1">Logo</Label>
				<Fileupload id="org_logo" name="org_logo" />
			</div>

			<div>
				<Button type="submit" class="cursor-pointer" size="xs">Save</Button>
			</div>
		</Card>
	</form>
</Container>
