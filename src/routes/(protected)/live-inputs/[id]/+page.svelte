<script lang="ts">
	import Container from '$components/Container.svelte';
	import CopyBlock from '$components/CopyBlock.svelte';
	import DotIcon from '$components/svg/DotIcon.svelte';
	import { Skeleton, Card, Button } from 'flowbite-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Container>
	<h1>Live Input</h1>

	<Card class="p-4 gap-4" size="xl">
		{#await data.liveInput}
			<Skeleton size="2xl" />
		{:then liveInput}
			<div>
				<Button
					href="/player?stream={liveInput.webRTCPlayback?.url}"
					class="cursor-pointer"
					size="xs"
					color="alternative">Watch</Button
				>
			</div>

			<div class="flex gap-1 items-center">
				<span>Status:</span>
				{#if liveInput.status.current.state == 'connected'}
					<DotIcon class="inline-block w-4 h-4 text-green-500" />
				{:else}
					<DotIcon class="inline-block w-4 h-4 text-red-500" />
				{/if}
			</div>

			<CopyBlock label="Ingest URL:" content={liveInput.webRTC?.url} />

			<CopyBlock label="Playback URL:" content={liveInput.webRTCPlayback?.url} />
		{:catch error}
			<p style="color: red">{error.message}</p>
		{/await}
	</Card>
</Container>
