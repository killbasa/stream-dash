<script lang="ts">
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
	} from 'flowbite-svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let users = $derived(data.users);

	const modals = $derived(
		new SvelteMap<string, boolean>(
			users.reduce((acc, user) => {
				acc.set(user.email, false);
				return acc;
			}, new Map<string, boolean>()),
		),
	);

	const scopes: { value: string; name: string }[] = [
		{ value: 'live-inputs', name: 'Live-Inputs' },
		{ value: 'wizard', name: 'Wizard' },
	];
</script>

<svelte:head>
	<title>User Management</title>
</svelte:head>

<section class="mx-auto flex w-full max-w-6xl flex-col items-center gap-8">
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
					<TableBodyCell>[{entry.scopes}]</TableBodyCell>
					<TableBodyCell>
						<Button color="alternative" onclick={() => modals.set(entry.email, true)}>
							Edit
						</Button>
					</TableBodyCell>
				</TableBodyRow>

				{#if modals.get(entry.email)}
					<Modal
						form
						open
						title="Edit user"
						classes={{ body: 'h-64' }}
						oncancel={() => modals.set(entry.email, false)}
						onaction={async (event) => {
							if (event.action === 'decline') {
								modals.set(entry.email, false);
								return;
							}

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
								alert(`Error: ${error.message}`);
								modals.set(entry.email, false);
								return;
							}

							const updatedUser = await response.json();
							const index = users.findIndex((user) => user.id === updatedUser.id);

							if (index !== -1) {
								users[index] = updatedUser;
								users = [...users];
							}

							modals.set(entry.email, false);
						}}
					>
						<Select
							name="role"
							placeholder="Select a role"
							value={entry.role}
							disabled={entry.role === 'admin'}
						>
							<option value="admin">Admin</option>
							<option value="editor">Editor</option>
							<option value="reader">Reader</option>
						</Select>

						<MultiSelect name="scopes" items={scopes} value={entry.scopes} />

						{#snippet footer()}
							<Button type="submit" value="success">Save</Button>
							<Button type="submit" value="decline" color="alternative">
								Cancel
							</Button>
						{/snippet}
					</Modal>
				{/if}
			{/each}
		</TableBody>
	</Table>
</section>
