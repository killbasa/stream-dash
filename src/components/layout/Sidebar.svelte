<script lang="ts">
	import SidebarItem from './SidebarItem.svelte';
	import { authClient } from '$lib/client/auth';
	import TelevisionIcon from '$components/svg/TelevisionIcon.svelte';
	import NotificationIcon from '$components/svg/NotificationIcon.svelte';
	import { Button } from 'flowbite-svelte';
	import UsersGroupSolid from 'flowbite-svelte-icons/UsersGroupSolid.svelte';
	import RectangleListSolid from 'flowbite-svelte-icons/RectangleListSolid.svelte';
	import GlobeSolid from 'flowbite-svelte-icons/GlobeSolid.svelte';
	import { goto } from '$app/navigation';

	const session = authClient.useSession();
</script>

<aside
	class="sticky top-0 flex h-screen w-48 flex-col justify-between bg-gray-800 border-r border-gray-700"
>
	<div class="overflow-y-auto px-3 py-4">
		<div class="flex flex-col justify-between gap-8">
			<div>
				<h2 class="mb-2">Event</h2>
				<ul class="space-y-2">
					<SidebarItem label="Blocks" href="/blocks">
						{#snippet icon()}
							<RectangleListSolid />
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
					<SidebarItem label="Notifications" href="/notifications">
						{#snippet icon()}
							<NotificationIcon class="h-5 w-5" />
						{/snippet}
					</SidebarItem>
				</ul>
			</div>
		</div>
	</div>
	<div class="overflow-y-auto px-3 py-4">
		<ul class="space-y-2">
			<div class="flex items-center gap-2 justify-between">
				<div class="flex items-center gap-2">
					{$session?.data?.user.name}
				</div>
				<Button
					type="button"
					class="cursor-pointer"
					size="xs"
					onclick={async () => {
						await authClient.signOut({
							fetchOptions: {
								onSuccess: () => goto('/login'),
							},
						});
					}}
				>
					Sign Out
				</Button>
			</div>
		</ul>
	</div>
</aside>
