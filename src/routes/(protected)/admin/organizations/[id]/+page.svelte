<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import PlaceholderAvatar from '$components/PlaceholderAvatar.svelte';
	import { Avatar, Card } from 'flowbite-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.organization.name} | Organizations</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Organizations</h1>

	<Card class="p-4 gap-4" size="xl">
		<div>
			<div class="flex flex-col">
				<label for="profile-picture" class="relative transition-opacity h-48 w-48">
					{#if data.organization.logo}
						<Avatar src={data.organization.logo} class="w-full h-full" />
					{:else}
						<PlaceholderAvatar />
					{/if}
				</label>
			</div>
		</div>

		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-1">
				<span class="text-3xl">{data.organization.name}</span>
			</div>
		</div>

		<div class="mt-2 space-x-1 text-xs opacity-75">
			<span>ID: {data.organization.id}</span>
		</div>
	</Card>

	<ul>
		{#each data.organization.members as member}
			<li>
				<span>{member.user.name}</span>
				<span>{member.role}</span>
			</li>
		{/each}
	</ul>
</Container>
