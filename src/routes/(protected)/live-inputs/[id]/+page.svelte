<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import CopyBlock from '$components/forms/CopyBlock.svelte';
	import { Alert, Badge, Button, Card } from 'flowbite-svelte';
	import InfoCircleSolid from 'flowbite-svelte-icons/InfoCircleSolid.svelte';
	import CheckCircleSolid from 'flowbite-svelte-icons/CheckCircleSolid.svelte';
	import type { PageProps } from './$types';
	import { invalidate } from '$app/navigation';

	let { data, params }: PageProps = $props();

	let errorNotif = $state<string>();
	let successNotif = $state<string>();

	const playerUrl = (url: string, embed: boolean) => {
		const baseUrl = 'https://play.offkai.tech/play?key=local&type=whep&url=';

		if (embed) return `${baseUrl}${url}&embed=true`;
		return `${baseUrl}${url}`;
	};

	const handleSync = async () => {
		const response = await fetch(`/api/live-inputs/${params.id}/sync`, {
			method: 'POST',
		});

		if (response.ok) {
			errorNotif = undefined;
			successNotif = 'Live input synced.';
		} else {
			const error = await response.json();
			errorNotif = error.message;
			return;
		}

		await invalidate('api:live-inputs');
	};
</script>

<svelte:head>
	<title>{data.liveInput.name} | Live Input</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Live Inputs</h1>

	<div>
		<Button
			href={playerUrl(data.liveInput.playbackWebrtcUrl, false)}
			class="cursor-pointer"
			size="xs"
			color="alternative"
			target="_blank">Watch</Button
		>
		<Button class="cursor-pointer" size="xs" onclick={handleSync}>Sync</Button>
		<Button href="/player/{data.liveInput.id}" class="cursor-pointer" size="xs" target="_blank"
			>Player</Button
		>
	</div>

	{#if errorNotif}
		<Alert color="red" dismissable onclick={() => (errorNotif = undefined)}>
			{#snippet icon()}<InfoCircleSolid class="h-5 w-5" />{/snippet}
			{errorNotif}
		</Alert>
	{/if}

	{#if successNotif}
		<Alert color="green" dismissable onclick={() => (successNotif = undefined)}>
			{#snippet icon()}<CheckCircleSolid class="h-5 w-5" />{/snippet}
			{successNotif}
		</Alert>
	{/if}

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

		<CopyBlock id="ingest-url" label="Ingest URL:" content={data.liveInput.ingestWebrtcUrl} />

		<CopyBlock
			id="playback-url"
			label="Playback URL:"
			content={data.liveInput.playbackWebrtcUrl}
		/>

		<CopyBlock
			id="embed-url"
			label="Embed URL:"
			content={window.location.origin + `/player/${data.liveInput.id}`}
		/>

		<CopyBlock
			id="embed-url-offkai"
			label="Embed URL (OffKai):"
			content={playerUrl(data.liveInput.playbackWebrtcUrl, true)}
		/>

		<CopyBlock
			id="player-url-offkai"
			label="Player URL (OffKai):"
			content={playerUrl(data.liveInput.playbackWebrtcUrl, false)}
		/>

		<div class="mt-2 space-x-1 text-xs opacity-75">
			<span>ID: {data.liveInput.id}</span>
			<span>•</span>
			<span>Cloudflare ID: {data.liveInput.cloudflareId}</span>
		</div>
	</Card>
</Container>
