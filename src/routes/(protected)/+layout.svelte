<script lang="ts">
	import Sidebar from '$components/Sidebar.svelte';
	import SidebarItem from '$components/SidebarItem.svelte';
	import TelevisionIcon from '$components/svg/TelevisionIcon.svelte';
	import HomeSolid from 'flowbite-svelte-icons/HomeSolid.svelte';
	import UsersGroupSolid from 'flowbite-svelte-icons/UsersGroupSolid.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="flex bg-gray-900 text-gray-300">
	<Sidebar>
		{#snippet items()}
			<SidebarItem label="Home" href="/">
				{#snippet icon()}
					<HomeSolid />
				{/snippet}
			</SidebarItem>
			<SidebarItem label="Live Inputs" href="/live-inputs">
				{#snippet icon()}
					<TelevisionIcon class="h-5 w-5" />
				{/snippet}
			</SidebarItem>
			<SidebarItem label="Users" href="/users">
				{#snippet icon()}
					<UsersGroupSolid />
				{/snippet}
			</SidebarItem>
		{/snippet}
	</Sidebar>

	<main class="flex flex-1 flex-col p-4 overflow-x-auto">
		{@render children()}
	</main>
</div>
