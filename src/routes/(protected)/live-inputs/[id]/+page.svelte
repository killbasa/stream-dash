<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<section class="mx-auto flex w-full max-w-6xl flex-col items-center gap-8">
	<h1>Live-Input</h1>

	<p>{data.liveInput.uid}</p>
</section>
