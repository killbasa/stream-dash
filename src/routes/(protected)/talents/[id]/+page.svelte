<script lang="ts">
	import Container from '$components/Container.svelte';
	import { toast } from '$lib/client/stores/toasts';
	import { Avatar, Card } from 'flowbite-svelte';
	import UserEditSolid from 'flowbite-svelte-icons/UserEditSolid.svelte';
	import UserSolid from 'flowbite-svelte-icons/UserSolid.svelte';
	import type { PageProps } from './$types';
	import type { ChangeEventHandler } from 'svelte/elements';
	import { invalidate } from '$app/navigation';

	let { data }: PageProps = $props();

	let avatarSrc = $derived(data.talent.imageUrl);

	const updateProfilePicture: ChangeEventHandler<HTMLInputElement> = async (event) => {
		const file = event.currentTarget.files?.[0];
		if (!file || !(file instanceof File)) return;

		const payload = new FormData();
		payload.append('image', file);

		const response = await fetch(`/api/talents/${data.talent.id}`, {
			method: 'PUT',
			body: payload,
		});

		if (!response.ok) {
			const error = await response.json();
			toast.error(`Error: ${error.message}`);
			return;
		}

		toast.success('Profile picture updated');

		await invalidate('api:talents');
	};
</script>

<svelte:head>
	<title>{data.talent.name} | Talents</title>
</svelte:head>

<Container>
	<Card class="p-4 gap-4" size="xl">
		<div>
			<div class="flex">
				<label
					for="profile-picture"
					class="cursor-pointer relative hover:opacity-80 transition-opacity h-48 w-48"
				>
					<div class="edit-icon">
						<UserEditSolid
							class="absolute z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shrink-0 h-12 w-12 text-black"
						/>
					</div>
					{#if avatarSrc}
						<Avatar src={avatarSrc} class="w-full h-full" />
					{:else}
						<div class="rounded-full bg-gray-600">
							<UserSolid class="w-full h-full" />
						</div>
					{/if}

					<input
						type="file"
						id="profile-picture"
						accept="image/*"
						class="hidden"
						onchange={updateProfilePicture}
					/>
				</label>
			</div>
		</div>

		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-1">
				<span class="text-3xl">{data.talent.name}</span>
				<span>{data.talent.id}</span>
			</div>

			<div>
				<span class="text-xl">Description</span>
				<p>{data.talent.description || 'None'}</p>
			</div>
		</div>
	</Card>
</Container>

<style lang="postcss">
	@references 'tailwindcss';

	.edit-icon {
		@apply opacity-0 transition-opacity;
	}

	label:hover > .edit-icon {
		@apply opacity-100;
	}
</style>
