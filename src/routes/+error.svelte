<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Error</title>
</svelte:head>

<section class="flex items-center justify-center h-96">
	<div class="flex flex-col gap-2">
		<span class="text-3xl">Code: {page.status}</span>
		<span class="text-3xl">{page.error?.message || 'An unexpected error occurred.'}</span>
	</div>
</section>
