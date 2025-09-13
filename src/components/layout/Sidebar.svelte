<script lang="ts">
	import SidebarItem from './SidebarItem.svelte';
	import TelevisionIcon from '$components/svg/TelevisionIcon.svelte';
	import CalendarEventIcon from '$components/svg/CalendarEventIcon.svelte';
	import ListIcon from '$components/svg/ListIcon.svelte';
	import { authClient } from '$src/lib/client/auth';
	import UsersGroupSolid from 'flowbite-svelte-icons/UsersGroupSolid.svelte';
	import GlobeSolid from 'flowbite-svelte-icons/GlobeSolid.svelte';
	import { Button } from 'flowbite-svelte';
	import HomeSolid from 'flowbite-svelte-icons/HomeSolid.svelte';
	import { goto } from '$app/navigation';

	const session = authClient.useSession();
</script>

<aside
	class="sticky top-0 flex h-screen w-64 flex-col bg-gray-800 border-r border-gray-700 justify-between"
>
	<div>
		<div class="overflow-y-auto px-3 py-4">
			<div class="flex flex-col justify-between gap-4">
				<SidebarItem label="Home" href="/">
					{#snippet icon()}
						<HomeSolid />
					{/snippet}
				</SidebarItem>

				<div>
					<h2 class="mb-2">Events</h2>
					<ul class="space-y-2">
						<li>
							<SidebarItem label="Blocks" href="/blocks">
								{#snippet icon()}
									<CalendarEventIcon class="h-5 w-5" />
								{/snippet}
							</SidebarItem>
						</li>
						<li>
							<SidebarItem label="Live Inputs" href="/live-inputs">
								{#snippet icon()}
									<TelevisionIcon class="h-5 w-5" />
								{/snippet}
							</SidebarItem>
						</li>
						<li>
							<SidebarItem label="Talents" href="/talents">
								{#snippet icon()}
									<UsersGroupSolid />
								{/snippet}
							</SidebarItem>
						</li>
						<li>
							<SidebarItem label="Locations" href="/locations">
								{#snippet icon()}
									<GlobeSolid />
								{/snippet}
							</SidebarItem>
						</li>
					</ul>
				</div>
				{#if $session.data?.user.role === 'admin'}
					<div>
						<h2 class="mb-2">Instance</h2>
						<ul class="space-y-2">
							<li>
								<SidebarItem label="Users" href="/admin/users">
									{#snippet icon()}
										<UsersGroupSolid />
									{/snippet}
								</SidebarItem>
							</li>
							<li>
								<SidebarItem label="Sessions" href="/admin/sessions">
									{#snippet icon()}
										<ListIcon class="h-5 w-5" />
									{/snippet}
								</SidebarItem>
							</li>
						</ul>
					</div>
				{/if}
			</div>
		</div>
	</div>
	<div class="px-2 py-3 bg-gray-700">
		<ul class="space-y-2 list-none">
			<li class="flex items-center gap-2 justify-between">
				<div class="flex items-center">
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
			</li>
		</ul>
	</div>
</aside>
