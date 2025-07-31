<script lang="ts">
	import Sidebar from '$components/Sidebar.svelte';
	import SidebarItem from '$components/SidebarItem.svelte';
	import HomeSolid from 'flowbite-svelte-icons/HomeSolid.svelte';
	import UsersGroupSolid from 'flowbite-svelte-icons/UsersGroupSolid.svelte';
	import GlobeSolid from 'flowbite-svelte-icons/GlobeSolid.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="flex">
	<Sidebar>
		{#snippet items()}
			<SidebarItem label="Home" href="/">
				{#snippet icon()}
					<HomeSolid />
				{/snippet}
			</SidebarItem>
			<SidebarItem label="Live-Inputs" href="/live-inputs">
				{#snippet icon()}
					<GlobeSolid />
				{/snippet}
			</SidebarItem>
			<SidebarItem label="Users" href="/users">
				{#snippet icon()}
					<UsersGroupSolid />
				{/snippet}
			</SidebarItem>
		{/snippet}
	</Sidebar>

	<main class="flex flex-1 flex-col p-4">
		{@render children()}
	</main>
</div>
