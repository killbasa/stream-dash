<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import { ReadableScopes } from '$lib/client/constants';
	import {
		Button,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Modal,
		Select,
		MultiSelect,
		Label,
		Input,
		Card,
		Alert,
	} from 'flowbite-svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import InfoCircleSolid from 'flowbite-svelte-icons/InfoCircleSolid.svelte';
	import type { PageProps } from './$types';
	import { invalidate } from '$app/navigation';

	let { data }: PageProps = $props();

	let users = $derived(data.users);
	let whitelists = $derived(data.whitelists);

	let userErrorNotif = $state<string>();
	let whitelistErrorNotif = $state<string>();

	let openWhitelistModal = $state(false);

	const userEditModals = $derived(
		new SvelteMap<string, boolean>(
			users.reduce((acc, user) => {
				acc.set(user.id, false);
				return acc;
			}, new Map<string, boolean>()),
		),
	);

	const userDeleteModdals = $derived(
		new SvelteMap<string, boolean>(
			users.reduce((acc, user) => {
				acc.set(user.id, false);
				return acc;
			}, new Map<string, boolean>()),
		),
	);

	const whitelistRevokeModals = $derived(
		new SvelteMap<string, boolean>(
			whitelists.reduce((acc, user) => {
				acc.set(user.id, false);
				return acc;
			}, new Map<string, boolean>()),
		),
	);

	const handleUserEdit = async (
		entry: (typeof data.users)[number],
		event: {
			data: FormData;
		},
	) => {
		const response = await fetch(`/api/users/${entry.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				id: entry.id,
				role: event.data.get('role') ?? undefined,
				scopes: event.data.getAll('scopes'),
			}),
		});

		if (response.ok) {
			userErrorNotif = undefined;
		} else {
			const error = await response.json();
			userErrorNotif = error.message;
			return;
		}

		await invalidate('api:users');
	};

	const handleUserDelete = async (entry: (typeof data.users)[number]) => {
		const response = await fetch(`/api/users/${entry.id}`, {
			method: 'DELETE',
		});

		if (response.ok) {
			userErrorNotif = undefined;
		} else {
			const error = await response.json();
			userErrorNotif = error.message;
			return;
		}

		await invalidate('api:users');
	};

	const handleWhitelistCreate = async (event: { data: FormData }) => {
		const response = await fetch('?/whitelistCreate', {
			method: 'POST',
			body: event.data,
		});

		if (response.ok) {
			whitelistErrorNotif = undefined;
		} else {
			const error = await response.json();
			whitelistErrorNotif = error.message;
			return;
		}

		await invalidate('api:users');
	};

	const handleWhitelistRevoke = async (entry: (typeof data.whitelists)[number]) => {
		const data = new FormData();
		data.append('whitelist_id', entry.id);

		const response = await fetch('?/whitelistRevoke', {
			method: 'POST',
			body: data,
		});

		if (response.ok) {
			whitelistErrorNotif = undefined;
		} else {
			const error = await response.json();
			whitelistErrorNotif = error.message;
			return;
		}

		await invalidate('api:users');
	};
</script>

<svelte:head>
	<title>Users</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Users</h1>

	{#if userErrorNotif}
		<Alert color="red" dismissable>
			{#snippet icon()}<InfoCircleSolid class="h-5 w-5" />{/snippet}
			{userErrorNotif}
		</Alert>
	{/if}

	<Card class="overflow-hidden" size="xl">
		<Table>
			<TableHead>
				<TableHeadCell class="w-1/4">Name</TableHeadCell>
				<TableHeadCell class="w-1/4">Email</TableHeadCell>
				<TableHeadCell class="w-1/4">Role</TableHeadCell>
				<TableHeadCell class="w-1/4">Actions</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each users as entry (entry.id)}
					<TableBodyRow>
						<TableBodyCell>{entry.name}</TableBodyCell>
						<TableBodyCell>{entry.email}</TableBodyCell>
						<TableBodyCell>{entry.role}</TableBodyCell>
						<TableBodyCell>
							<Button
								href="/users/{entry.id}"
								size="xs"
								type="button"
								class="cursor-pointer"
								color="alternative"
							>
								View
							</Button>
							<Button
								size="xs"
								type="button"
								class="cursor-pointer"
								color="alternative"
								onclick={() => userEditModals.set(entry.id, true)}
							>
								Edit
							</Button>
							<Button
								size="xs"
								type="button"
								class="cursor-pointer"
								color="alternative"
								onclick={() => userDeleteModdals.set(entry.id, true)}
							>
								Delete
							</Button>
						</TableBodyCell>
					</TableBodyRow>

					{#if userEditModals.get(entry.id)}
						<Modal
							form
							open
							title="Edit user"
							class="overflow-visible"
							classes={{ body: 'overflow-y-visible' }}
							oncancel={() => userEditModals.set(entry.id, false)}
							onaction={async (event) => {
								await handleUserEdit(entry, event);
								userEditModals.set(entry.id, false);
							}}
						>
							<div>
								<Label for="user_role" class="mb-2">Role</Label>
								<Select
									name="user_role"
									placeholder="Select a role"
									value={entry.role}
									disabled={entry.role === 'admin'}
								>
									<option value="admin">Admin</option>
									<option value="editor">User</option>
								</Select>
							</div>

							<div>
								<Label for="user_scopes" class="mb-2">Scopes</Label>
								<MultiSelect
									name="scopes"
									items={ReadableScopes}
									value={entry.scopes}
								/>
							</div>

							{#snippet footer()}
								<Button
									size="xs"
									type="submit"
									value="success"
									class="cursor-pointer"
								>
									Save
								</Button>
								<Button
									size="xs"
									type="button"
									color="alternative"
									class="cursor-pointer"
									onclick={() => userEditModals.set(entry.id, false)}
								>
									Cancel
								</Button>
							{/snippet}
						</Modal>
					{/if}

					{#if userDeleteModdals.get(entry.id)}
						<Modal
							form
							open
							title="Delete user"
							class="overflow-visible"
							classes={{ body: 'overflow-y-visible' }}
							oncancel={() => userDeleteModdals.set(entry.id, false)}
							onaction={async () => {
								await handleUserDelete(entry);
								userDeleteModdals.set(entry.id, false);
							}}
						>
							<p>Are you sure you want to delete "{entry.email}"?</p>
							<p>This will also remove the whitelist entry.</p>

							{#snippet footer()}
								<Button
									size="xs"
									type="submit"
									value="success"
									class="cursor-pointer"
								>
									Delete
								</Button>
								<Button
									size="xs"
									type="button"
									color="alternative"
									class="cursor-pointer"
									onclick={() => userDeleteModdals.set(entry.id, false)}
								>
									Cancel
								</Button>
							{/snippet}
						</Modal>
					{/if}
				{/each}
			</TableBody>
		</Table>
	</Card>

	<h2>Whitelist</h2>

	<div>
		<Button size="xs" onclick={() => (openWhitelistModal = true)} class="cursor-pointer">
			Create
		</Button>
	</div>

	{#if whitelistErrorNotif}
		<Alert color="red" dismissable>
			{#snippet icon()}<InfoCircleSolid class="h-5 w-5" />{/snippet}
			{whitelistErrorNotif}
		</Alert>
	{/if}

	<Card class="overflow-hidden" size="xl">
		<Table>
			<TableHead>
				<TableHeadCell class="w-1/4">Email</TableHeadCell>
				<TableHeadCell class="w-2/4">Role</TableHeadCell>
				<TableHeadCell class="w-1/4">Actions</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each whitelists as entry (entry.id)}
					<TableBodyRow>
						<TableBodyCell>{entry.email}</TableBodyCell>
						<TableBodyCell>{entry.defaultRole}</TableBodyCell>
						<TableBodyCell>
							<Button
								size="xs"
								type="button"
								class="cursor-pointer"
								color="alternative"
								onclick={() => whitelistRevokeModals.set(entry.id, true)}
							>
								Revoke
							</Button>
						</TableBodyCell>
					</TableBodyRow>

					{#if whitelistRevokeModals.get(entry.id)}
						<Modal
							form
							open
							title="Delete whitelist"
							class="overflow-visible"
							classes={{ body: 'overflow-y-visible' }}
							oncancel={() => whitelistRevokeModals.set(entry.id, false)}
							onaction={async () => {
								await handleWhitelistRevoke(entry);
								whitelistRevokeModals.set(entry.id, false);
							}}
						>
							<p>
								Are you sure you want to revoke the whitelist for "{entry.email}"?
							</p>

							{#snippet footer()}
								<Button
									size="xs"
									type="submit"
									value="success"
									class="cursor-pointer"
								>
									Revoke
								</Button>
								<Button
									size="xs"
									type="button"
									color="alternative"
									class="cursor-pointer"
									onclick={() => whitelistRevokeModals.set(entry.id, false)}
								>
									Cancel
								</Button>
							{/snippet}
						</Modal>
					{/if}
				{/each}
			</TableBody>
		</Table>
	</Card>

	<Modal
		form
		title="Whitelist a user"
		class="overflow-visible"
		classes={{ body: 'overflow-y-visible' }}
		bind:open={openWhitelistModal}
		onaction={handleWhitelistCreate}
	>
		<div>
			<Label for="whitelist_email" class="mb-2">Email</Label>
			<Input
				type="email"
				id="whitelist_email"
				name="whitelist_email"
				required
				autocomplete="off"
			/>
		</div>

		<div>
			<Label for="whitelist_role" class="mb-2">Default Role</Label>
			<Select name="whitelist_role" placeholder="Select a role" clearable>
				<option value="admin">Admin</option>
				<option value="user">User</option>
			</Select>
		</div>

		{#snippet footer()}
			<Button size="xs" type="submit" value="success" class="cursor-pointer">Save</Button>
			<Button
				size="xs"
				type="button"
				color="alternative"
				class="cursor-pointer"
				onclick={() => (openWhitelistModal = false)}
			>
				Cancel
			</Button>
		{/snippet}
	</Modal>
</Container>
