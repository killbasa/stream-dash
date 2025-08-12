<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.name}</title>

	<meta property="og:type" content="website" />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:title" content={data.name} />
</svelte:head>

<iframe
	title="Live Input Player"
	src="https://{data.customerId}.cloudflarestream.com/{data.id}/iframe?autoplay=1"
	style="border: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
	allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
></iframe>
