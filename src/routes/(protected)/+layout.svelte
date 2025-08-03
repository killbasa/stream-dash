<script lang="ts">
	import Sidebar from '$components/Sidebar.svelte';
	import SidebarItem from '$components/SidebarItem.svelte';
	import TelevisionIcon from '$components/svg/TelevisionIcon.svelte';
	import Toaster from '$components/Toaster.svelte';
	import HomeSolid from 'flowbite-svelte-icons/HomeSolid.svelte';
	import UsersGroupSolid from 'flowbite-svelte-icons/UsersGroupSolid.svelte';
	import RectangleListSolid from 'flowbite-svelte-icons/RectangleListSolid.svelte';
	import GlobeSolid from 'flowbite-svelte-icons/GlobeSolid.svelte';
	import CalendarMonthSolid from 'flowbite-svelte-icons/CalendarMonthSolid.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<Toaster />

<div class="flex bg-gray-900 text-gray-300">
	<Sidebar>
		{#snippet list()}
			<div class="flex flex-col justify-between gap-8">
				<div>
					<h2 class="mb-2">Event</h2>
					<ul class="space-y-2">
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
						<SidebarItem label="Talents" href="/talents">
							{#snippet icon()}
								<UsersGroupSolid />
							{/snippet}
						</SidebarItem>
						<SidebarItem label="Locations" href="/locations">
							{#snippet icon()}
								<GlobeSolid />
							{/snippet}
						</SidebarItem>
						<SidebarItem label="Blocks" href="/blocks">
							{#snippet icon()}
								<RectangleListSolid />
							{/snippet}
						</SidebarItem>
						<SidebarItem label="Schedule" href="/schedule">
							{#snippet icon()}
								<CalendarMonthSolid />
							{/snippet}
						</SidebarItem>
					</ul>
				</div>
				<div>
					<h2 class="mb-2">Admin</h2>
					<ul class="space-y-2">
						<SidebarItem label="Users" href="/users">
							{#snippet icon()}
								<UsersGroupSolid />
							{/snippet}
						</SidebarItem>
					</ul>
				</div>
			</div>
		{/snippet}
	</Sidebar>

	<main class="flex flex-1 flex-col p-4 overflow-x-auto">
		{@render children()}
	</main>
</div>
