<script lang="ts">
	import Container from '$components/Container.svelte';
	import { toast } from '$lib/client/stores/toasts';
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
	} from 'flowbite-svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import type { PageProps } from './$types';
	import { invalidate } from '$app/navigation';

	let { data }: PageProps = $props();

	let users = $derived(data.users);
	let whitelists = $derived(data.whitelists);

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

	const scopes: { value: string; name: string }[] = [
		{ value: 'live-inputs', name: 'Live Inputs' },
		{ value: 'talents', name: 'Talents' },
		{ value: 'locations', name: 'Locations' },
		{ value: 'blocks', name: 'Blocks' },
	];

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

		if (!response.ok) {
			const error = await response.json();
			toast.error(`Error: ${error.message}`);
			return;
		}

		toast.success('User updated');
		await invalidate('api:users');
	};

	const handleUserDelete = async (entry: (typeof data.users)[number]) => {
		const response = await fetch(`/api/users/${entry.id}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			const error = await response.json();
			toast.error(`Error: ${error.message}`);
			return;
		}

		toast.success('User deleted');
		await invalidate('api:users');
	};

	const handleWhitelistCreate = async (event: { data: FormData }) => {
		const response = await fetch('/api/whitelists', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: event.data.get('whitelist_email'),
				defaultRole: event.data.get('whitelist_role') ?? undefined,
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			toast.error(`Error: ${error.message}`);
			return;
		}

		toast.success('Whitelist entry created');
		await invalidate('api:users');
	};

	const handleWhitelistRevoke = async (entry: (typeof data.whitelists)[number]) => {
		const response = await fetch(`/api/whitelists/${entry.id}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			const error = await response.json();
			toast.error(`Error: ${error.message}`);
			return;
		}

		toast.success('Whitelist entry revoked');
		await invalidate('api:users');
	};
</script>

<svelte:head>
	<title>User Management</title>
</svelte:head>

<Container>
	<h1>User Management</h1>

	<Table>
		<TableHead>
			<TableHeadCell>Name</TableHeadCell>
			<TableHeadCell>Email</TableHeadCell>
			<TableHeadCell>Role</TableHeadCell>
			<TableHeadCell>Scopes</TableHeadCell>
			<TableHeadCell>Actions</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each users as entry (entry.id)}
				<TableBodyRow>
					<TableBodyCell>{entry.name}</TableBodyCell>
					<TableBodyCell>{entry.email}</TableBodyCell>
					<TableBodyCell>{entry.role}</TableBodyCell>
					<TableBodyCell>[{entry.scopes.join(', ')}]</TableBodyCell>
					<TableBodyCell>
						<Button
							type="button"
							class="cursor-pointer"
							size="xs"
							color="alternative"
							onclick={() => userEditModals.set(entry.id, true)}
						>
							Edit
						</Button>
						<Button
							type="button"
							class="cursor-pointer"
							size="xs"
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
								<option value="editor">Editor</option>
								<option value="reader">Reader</option>
							</Select>
						</div>

						<div>
							<Label for="user_scopes" class="mb-2">Scopes</Label>
							<MultiSelect name="scopes" items={scopes} value={entry.scopes} />
						</div>

						{#snippet footer()}
							<Button type="submit" value="success" class="cursor-pointer">
								Save
							</Button>
							<Button
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
						oncancel={() => userDeleteModdals.set(entry.id, false)}
						onaction={async () => {
							await handleUserDelete(entry);
							userDeleteModdals.set(entry.id, false);
						}}
					>
						<p>Are you sure you want to delete "{entry.email}"?</p>
						<p>This will also remove the whitelist entry.</p>

						{#snippet footer()}
							<Button type="submit" value="success" class="cursor-pointer">
								Delete
							</Button>
							<Button
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

	<h1>Whitelist</h1>
	<div>
		<Button onclick={() => (openWhitelistModal = true)} class="cursor-pointer" size="xs">
			Create
		</Button>
		<Modal
			form
			bind:open={openWhitelistModal}
			title="Whitelist a user"
			onaction={handleWhitelistCreate}
		>
			<div>
				<Label for="whitelist_email" class="mb-2">Email</Label>
				<Input type="email" id="whitelist_email" name="whitelist_email" required />
			</div>

			<div>
				<Label for="whitelist_role" class="mb-2">Default Role</Label>
				<Select name="whitelist_role" placeholder="Select a role" clearable>
					<option value="admin">Admin</option>
					<option value="editor">Editor</option>
					<option value="reader">Reader</option>
				</Select>
			</div>

			{#snippet footer()}
				<Button type="submit" value="success" class="cursor-pointer">Save</Button>
				<Button
					type="button"
					color="alternative"
					class="cursor-pointer"
					onclick={() => (openWhitelistModal = false)}
				>
					Cancel
				</Button>
			{/snippet}
		</Modal>
	</div>

	<Table>
		<TableHead>
			<TableHeadCell>Email</TableHeadCell>
			<TableHeadCell>Role</TableHeadCell>
			<TableHeadCell>Actions</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each whitelists as entry (entry.id)}
				<TableBodyRow>
					<TableBodyCell>{entry.email}</TableBodyCell>
					<TableBodyCell>{entry.defaultRole}</TableBodyCell>
					<TableBodyCell>
						<Button
							type="button"
							class="cursor-pointer"
							size="xs"
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
						oncancel={() => whitelistRevokeModals.set(entry.id, false)}
						onaction={async () => {
							await handleWhitelistRevoke(entry);
							whitelistRevokeModals.set(entry.id, false);
						}}
					>
						<p>Are you sure you want to revoke the whitelist for "{entry.email}"?</p>

						{#snippet footer()}
							<Button type="submit" value="success" class="cursor-pointer">
								Revoke
							</Button>
							<Button
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
</Container>
