<script lang="ts">
	import '../app.css';
	import '../app.sched.css';

	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

{@render children()}
