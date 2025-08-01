<script lang="ts">
	import Container from '$components/Container.svelte';
	import { Skeleton } from 'flowbite-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Container>
	<h1>Live Input</h1>

	<div>
		{#await data.liveInput}
			<Skeleton size="2xl" />
		{:then liveInput}
			<span>Ingest:</span>
			<pre class="text-sm">{liveInput.webRTC?.url}</pre>

			<span>Playback:</span>
			<pre class="text-sm">{liveInput.webRTCPlayback?.url}</pre>
		{:catch error}
			<p style="color: red">{error.message}</p>
		{/await}
	</div>
</Container>
