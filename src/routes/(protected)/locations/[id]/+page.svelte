<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import { Card } from 'flowbite-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.location.name} | Locations</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Locations</h1>

	<Card class="p-4 gap-4" size="xl">
		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-1">
				<span class="text-3xl">{data.location.name}</span>
				<span>{data.location.id}</span>
			</div>

			<div>
				<span class="text-xl">Description</span>
				<p>{data.location.description || 'None'}</p>
			</div>
		</div>
	</Card>
</Container>
