<script lang="ts">
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<main class="flex flex-1 flex-col p-4">
	{@render children()}
</main>
