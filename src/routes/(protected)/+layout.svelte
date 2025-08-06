<script lang="ts">
	import Sidebar from '$components/layout/Sidebar.svelte';
	import Toaster from '$components/Toaster.svelte';
	import { Drawer, NavHamburger } from 'flowbite-svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	let hidden = $state(true);
</script>

<Toaster />

<Drawer bind:hidden class="bg-gray-900 text-gray-300 w-48 p-0">
	<Sidebar />
</Drawer>

<div class="flex bg-gray-900 text-gray-300 flex-col sm:flex-row min-h-screen">
	<div class="hidden sm:block">
		<Sidebar />
	</div>
	<div class="block sm:hidden">
		<NavHamburger
			onclick={() => (hidden = false)}
			class="mx-4 my-2 bg-gray-700 cursor-pointer"
		/>
	</div>

	<main class="flex flex-1 flex-col p-2 sm:p-4 overflow-x-auto">
		{@render children()}
	</main>
</div>
