<script lang="ts">
	import SidebarItem from './SidebarItem.svelte';
	import OrgSelector from './OrgSelector.svelte';
	import TelevisionIcon from '$components/svg/TelevisionIcon.svelte';
	import CalendarEventIcon from '$components/svg/CalendarEventIcon.svelte';
	import CompanyIcon from '$components/svg/CompanyIcon.svelte';
	import ListIcon from '$components/svg/ListIcon.svelte';
	import { authClient } from '$src/lib/client/auth';
	import CloudflareIcon from '$components/svg/CloudflareIcon.svelte';
	import UsersGroupSolid from 'flowbite-svelte-icons/UsersGroupSolid.svelte';
	import GlobeSolid from 'flowbite-svelte-icons/GlobeSolid.svelte';
	import { Button } from 'flowbite-svelte';
	import HomeSolid from 'flowbite-svelte-icons/HomeSolid.svelte';
	import { goto } from '$app/navigation';

	const session = authClient.useSession();

	const activeOrg = authClient.useActiveOrganization();
</script>

<aside
	class="sticky top-0 flex h-screen w-64 flex-col bg-gray-800 border-r border-gray-700 justify-between"
>
	<div>
		<div class="px-2 py-2 bg-gray-700 flex">
			<!-- <div class="h-6 w-6">
				{#if $activeOrg.data?.logo}
					<Avatar src={$activeOrg.data.logo} class="w-full h-full" />
				{:else}
					<PlaceholderAvatar />
				{/if}
			</div> -->
			<OrgSelector />
		</div>
		<div class="overflow-y-auto px-3 py-4">
			<div class="flex flex-col justify-between gap-4">
				<SidebarItem label="Home" href="/">
					{#snippet icon()}
						<HomeSolid />
					{/snippet}
				</SidebarItem>

				{#if $activeOrg.data}
					<div>
						<h2 class="mb-2">Events</h2>
						<ul class="space-y-2">
							<li>
								<SidebarItem label="Blocks" href="/{$activeOrg.data.slug}/blocks">
									{#snippet icon()}
										<CalendarEventIcon class="h-5 w-5" />
									{/snippet}
								</SidebarItem>
							</li>
							<li>
								<SidebarItem
									label="Live Inputs"
									href="/{$activeOrg.data.slug}/live-inputs"
								>
									{#snippet icon()}
										<TelevisionIcon class="h-5 w-5" />
									{/snippet}
								</SidebarItem>
							</li>
							<li>
								<SidebarItem label="Talents" href="/{$activeOrg.data.slug}/talents">
									{#snippet icon()}
										<UsersGroupSolid />
									{/snippet}
								</SidebarItem>
							</li>
							<li>
								<SidebarItem
									label="Locations"
									href="/{$activeOrg.data.slug}/locations"
								>
									{#snippet icon()}
										<GlobeSolid />
									{/snippet}
								</SidebarItem>
							</li>
						</ul>
					</div>
					<div>
						<h2 class="mb-2">Organization</h2>
						<ul class="space-y-2">
							<li>
								<SidebarItem
									label="Cloudflare"
									href="/{$activeOrg.data.slug}/cloudflare"
								>
									{#snippet icon()}
										<CloudflareIcon class="h-5 w-5" />
									{/snippet}
								</SidebarItem>
							</li>
							<li>
								<SidebarItem label="Members" href="/{$activeOrg.data.slug}/members">
									{#snippet icon()}
										<UsersGroupSolid />
									{/snippet}
								</SidebarItem>
							</li>
							<li>
								<SidebarItem label="Settings" href="/{$activeOrg.data.slug}">
									{#snippet icon()}
										<CompanyIcon class="h-5 w-5" />
									{/snippet}
								</SidebarItem>
							</li>
						</ul>
					</div>
				{/if}
				{#if $session.data?.user.role === 'superadmin'}
					<div>
						<h2 class="mb-2">Instance</h2>
						<ul class="space-y-2">
							<li>
								<SidebarItem label="Organizations" href="/admin/organizations">
									{#snippet icon()}
										<CompanyIcon class="h-5 w-5" />
									{/snippet}
								</SidebarItem>
							</li>
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
