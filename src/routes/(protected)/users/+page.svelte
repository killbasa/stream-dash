<script lang="ts">
	import Container from '$components/Container.svelte';
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
		{ value: 'live-inputs', name: 'Live Inputs' },
		{ value: 'wizard', name: 'Wizard' },
	];

	const handleAction = async (
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
			alert(`Error: ${error.message}`);
			return;
		}

		const updatedUser = await response.json();
		const index = users.findIndex((user) => user.id === updatedUser.id);

		if (index !== -1) {
			users[index] = updatedUser;
			users = [...users];
		}
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
					<TableBodyCell>[{entry.scopes}]</TableBodyCell>
					<TableBodyCell>
						<Button
							type="button"
							class="cursor-pointer"
							size="xs"
							color="alternative"
							onclick={() => modals.set(entry.email, true)}
						>
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
							await handleAction(entry, event);
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
							<Button type="submit" value="success" class="cursor-pointer"
								>Save</Button
							>
							<Button
								type="button"
								color="alternative"
								class="cursor-pointer"
								onclick={() => modals.set(entry.email, false)}
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
