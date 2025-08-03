<script lang="ts">
	import '../app.css';
	import '@event-calendar/core/index.css';

	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

{@render children()}
