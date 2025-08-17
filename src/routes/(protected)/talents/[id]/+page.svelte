<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import PlaceholderAvatar from '$components/PlaceholderAvatar.svelte';
	import { AuthScopes } from '$src/lib/client/constants';
	import { Avatar, Card } from 'flowbite-svelte';
	import UserEditSolid from 'flowbite-svelte-icons/UserEditSolid.svelte';
	import type { PageProps } from './$types';
	import type { ChangeEventHandler } from 'svelte/elements';
	import { invalidate } from '$app/navigation';

	let { data }: PageProps = $props();

	const canEdit =
		data.user?.role === 'admin' || data.user?.scopes?.includes(AuthScopes.TalentsEdit);

	let avatarSrc = $derived(data.talent.imageUrl);

	let errorNotif = $state<string>();

	const updateProfilePicture: ChangeEventHandler<HTMLInputElement> = async (event) => {
		if (!canEdit) {
			return;
		}

		const file = event.currentTarget.files?.item(0);
		if (!file) return;

		const payload = new FormData();
		payload.append('image', file);

		const response = await fetch(`/api/talents/${data.talent.id}`, {
			method: 'PUT',
			body: payload,
		});

		if (response.ok) {
			errorNotif = undefined;
		} else {
			const error = await response.json();
			errorNotif = error.message;
			return;
		}

		await invalidate('api:talents');
	};
</script>

<svelte:head>
	<title>{data.talent.name} | Talents</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Talents</h1>

	<Card class="p-4 gap-4" size="xl">
		<div>
			<div class="flex flex-col">
				<label
					for="profile-picture"
					class="relative transition-opacity h-48 w-48"
					class:cursor-pointer={canEdit}
					class:hover:opacity-80={canEdit}
				>
					{#if canEdit}
						<div class="edit-icon">
							<UserEditSolid
								class="absolute z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shrink-0 h-12 w-12 text-black"
							/>
						</div>
					{/if}

					{#if avatarSrc}
						<Avatar src={avatarSrc} class="w-full h-full" />
					{:else}
						<PlaceholderAvatar />
					{/if}

					{#if canEdit}
						<input
							type="file"
							id="profile-picture"
							accept="image/*"
							class="hidden"
							onchange={updateProfilePicture}
						/>
					{/if}
				</label>

				{#if errorNotif}
					<span class="text-red-500">{errorNotif}</span>
				{/if}
			</div>
		</div>

		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-1">
				<span class="text-3xl">{data.talent.name}</span>
			</div>

			<div>
				<span class="text-xl">Description</span>
				<p>{data.talent.description || 'None'}</p>
			</div>
		</div>

		<div class="mt-2 space-x-1 text-xs opacity-75">
			<span>ID: {data.talent.id}</span>
		</div>
	</Card>
</Container>

<style lang="postcss">
	@references '$src/app.css';

	.edit-icon {
		@apply opacity-0 transition-opacity;
	}

	label:hover > .edit-icon {
		@apply opacity-100;
	}
</style>
