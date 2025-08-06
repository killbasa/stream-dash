<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import CopyBlock from '$components/forms/CopyBlock.svelte';
	import { toast } from '$lib/client/stores/toasts';
	import { Badge, Button, Card } from 'flowbite-svelte';
	import type { PageProps } from './$types';
	import { invalidate } from '$app/navigation';

	let { data, params }: PageProps = $props();

	const playerUrl = (url: string, embed: boolean) => {
		const baseUrl = 'https://play.offkai.tech/play?key=local&type=whep&url=';

		if (embed) return `${baseUrl}${url}&embed=true`;
		return `${baseUrl}${url}`;
	};

	const handleSync = async () => {
		const response = await fetch(`/api/live-inputs/${params.id}/sync`, {
			method: 'POST',
		});

		if (!response.ok) {
			const error = await response.json();
			toast.error(`Error: ${error.message}`);
			return;
		}

		toast.success('Live Input synchronized');
		await invalidate('api:live-inputs');
	};
</script>

<svelte:head>
	<title>{data.liveInput.name} | Live Input</title>
</svelte:head>

<Container>
	<h1>Live Input</h1>

	<div>
		<Button
			href={playerUrl(data.liveInput.playbackWebrtcUrl, false)}
			class="cursor-pointer"
			size="xs"
			color="alternative"
			target="_blank">Watch</Button
		>
		<Button class="cursor-pointer" size="xs" onclick={handleSync}>Sync</Button>
	</div>

	<Card class="p-4 gap-4" size="xl">
		<h2 class="text-xl">Title: {data.liveInput.name}</h2>

		<div class="flex items-center">
			<span>Status:</span>
			{#if data.liveInput.status === 'connected'}
				<Badge color="green" class="ml-2">Online</Badge>
			{:else if data.liveInput.status === 'disconnected'}
				<Badge color="red" class="ml-2">Offline</Badge>
			{:else if data.liveInput.status === 'errored'}
				<Badge color="yellow" class="ml-2">Error</Badge>
			{:else}
				<Badge color="gray" class="ml-2">Unknown</Badge>
			{/if}
		</div>

		<span>Cloudflare ID: {data.liveInput.cloudflareId}</span>

		<CopyBlock label="Ingest URL:" content={data.liveInput.ingestWebrtcUrl} />

		<CopyBlock label="Playback URL:" content={data.liveInput.playbackWebrtcUrl} />

		<CopyBlock
			label="Player URL:"
			content={playerUrl(data.liveInput.playbackWebrtcUrl, false)}
		/>

		<CopyBlock label="Embed URL:" content={playerUrl(data.liveInput.playbackWebrtcUrl, true)} />
	</Card>
</Container>
