<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
	}: {
		children: Snippet;
	} = $props();
</script>

<section class="mx-auto flex w-full max-w-6xl flex-col gap-4">
	{@render children()}
</section>
