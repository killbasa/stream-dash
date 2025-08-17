<script lang="ts">
	import Sidebar from '$components/layout/Sidebar.svelte';
	import { Drawer, NavHamburger } from 'flowbite-svelte';
	import { writable } from 'svelte/store';
	import type { LayoutProps } from './$types';
	import { onNavigate } from '$app/navigation';

	let { children }: LayoutProps = $props();

	let open = writable(false);

	onNavigate(() => {
		if ($open) {
			open.set(false);
		}
	});
</script>

<Drawer bind:open={$open} class="bg-gray-900 text-gray-300 w-48 p-0">
	<Sidebar />
</Drawer>

<div class="flex bg-gray-900 text-gray-300 flex-col sm:flex-row min-h-screen">
	<div class="hidden sm:block">
		<Sidebar />
	</div>
	<div class="block sm:hidden">
		<NavHamburger class="m-2 bg-gray-700 cursor-pointer" onclick={() => open.set(true)} />
	</div>

	<main class="flex flex-1 flex-col p-2 sm:p-4 overflow-x-auto">
		{@render children()}
	</main>
</div>
