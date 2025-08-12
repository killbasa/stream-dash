<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<iframe
	title="Live Input Player"
	src="https://{data.customerId}.cloudflarestream.com/{data.id}/iframe?autoplay=1"
	style="border: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
	allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
></iframe>
