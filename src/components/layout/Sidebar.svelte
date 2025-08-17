<script lang="ts">
	import SidebarItem from './SidebarItem.svelte';
	import TelevisionIcon from '$components/svg/TelevisionIcon.svelte';
	import { authClient } from '$src/lib/client/auth';
	import { Button, Select } from 'flowbite-svelte';
	import UsersGroupSolid from 'flowbite-svelte-icons/UsersGroupSolid.svelte';
	import RectangleListSolid from 'flowbite-svelte-icons/RectangleListSolid.svelte';
	import GlobeSolid from 'flowbite-svelte-icons/GlobeSolid.svelte';
	import type { Organization } from '$src/lib/client/auth';
	import { goto } from '$app/navigation';

	const session = authClient.useSession();
	const organizations = authClient.useListOrganizations();

	let selectedOrganization = $state<Organization>();
</script>

<aside
	class="sticky top-0 flex h-screen w-48 flex-col bg-gray-800 border-r border-gray-700 justify-between"
>
	<div>
		<div class="px-3 py-4 bg-gray-700">
			<Select
				placeholder="Select an organization"
				bind:value={selectedOrganization}
				clearable
			>
				{#each $organizations.data ?? [] as org}
					<option value={org.id}>{org.name}</option>
				{/each}
			</Select>
		</div>
		<div class="overflow-y-auto px-3 py-4">
			<div class="flex flex-col justify-between gap-4">
				{#if selectedOrganization}
					<div>
						<h2 class="mb-2">Management</h2>
						<ul class="space-y-2">
							<SidebarItem label="Blocks" href="/{selectedOrganization.slug}/blocks">
								{#snippet icon()}
									<RectangleListSolid />
								{/snippet}
							</SidebarItem>
							<SidebarItem
								label="Live Inputs"
								href="/{selectedOrganization.slug}/live-inputs"
							>
								{#snippet icon()}
									<TelevisionIcon class="h-5 w-5" />
								{/snippet}
							</SidebarItem>
							<SidebarItem
								label="Talents"
								href="/{selectedOrganization.slug}/talents"
							>
								{#snippet icon()}
									<UsersGroupSolid />
								{/snippet}
							</SidebarItem>
							<SidebarItem
								label="Locations"
								href="/{selectedOrganization.slug}/locations"
							>
								{#snippet icon()}
									<GlobeSolid />
								{/snippet}
							</SidebarItem>
						</ul>
					</div>
					<div>
						<h2 class="mb-2">Admin</h2>
						<ul class="space-y-2">
							<SidebarItem label="Organization" href="/{selectedOrganization.slug}">
								{#snippet icon()}
									<UsersGroupSolid />
								{/snippet}
							</SidebarItem>
							<SidebarItem
								label="Members"
								href="/{selectedOrganization.slug}/members"
							>
								{#snippet icon()}
									<UsersGroupSolid />
								{/snippet}
							</SidebarItem>
						</ul>
					</div>
				{/if}
				<div>
					<h2 class="mb-2">Instance</h2>
					<ul class="space-y-2">
						<SidebarItem label="Organizations" href="/admin/organizations">
							{#snippet icon()}
								<UsersGroupSolid />
							{/snippet}
						</SidebarItem>
						<SidebarItem label="Users" href="/admin/users">
							{#snippet icon()}
								<UsersGroupSolid />
							{/snippet}
						</SidebarItem>
					</ul>
				</div>
			</div>
		</div>
	</div>
	<div class="px-2 py-3 bg-gray-700">
		<ul class="space-y-2 list-none">
			<li class="flex items-center gap-2 justify-between">
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
			</li>
		</ul>
	</div>
</aside>
