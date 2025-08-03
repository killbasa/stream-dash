<script lang="ts">
	import Container from '$components/Container.svelte';
	import { toast } from '$lib/client/stores/toasts';
	import {
		Badge,
		Button,
		Input,
		Label,
		Modal,
		Select,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Textarea,
		Tooltip,
	} from 'flowbite-svelte';
	import QuestionCircleSolid from 'flowbite-svelte-icons/QuestionCircleSolid.svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import type { PageProps } from './$types';
	import { invalidate } from '$app/navigation';

	let { data }: PageProps = $props();

	let openCreateModal = $state(false);
	let liveInputs = $derived(data.liveInputs);
	let pendingLiveInputs = $derived(data.pendingLiveInputs);

	const liveInputDeleteModals = $derived(
		new SvelteMap<string, boolean>(
			liveInputs.reduce((acc, liveInput) => {
				acc.set(liveInput.id, false);
				return acc;
			}, new Map<string, boolean>()),
		),
	);

	const liveInputImportModals = $derived(
		new SvelteMap<string, boolean>(
			pendingLiveInputs.reduce((acc, liveInput) => {
				acc.set(liveInput.id, false);
				return acc;
			}, new Map<string, boolean>()),
		),
	);

	const handleCreate = async (event: { data: FormData }) => {
		const response = await fetch('/api/live-inputs', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: event.data.get('liveinput_name'),
				type: event.data.get('liveinput_type'),
				description: event.data.get('liveinput_description'),
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			toast.error(`Error: ${error.message}`);
			return;
		}

		toast.success('Live Input created');
		await invalidate('api:live-inputs');
	};

	const handleDelete = async (id: string) => {
		const response = await fetch(`/api/live-inputs/${id}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			const error = await response.json();
			toast.error(`Error: ${error.message}`);
			return;
		}

		toast.success('Live Input deleted');
		await invalidate('api:live-inputs');
	};

	const handleSync = async () => {
		const response = await fetch(`/api/live-inputs/sync`, {
			method: 'POST',
		});

		if (!response.ok) {
			const error = await response.json();
			toast.error(`Error: ${error.message}`);
			return;
		}

		toast.success('Live Inputs synchronized');
		await invalidate('api:live-inputs');
	};

	const handleImport = async (id: string, event: { data: FormData }) => {
		const response = await fetch(`/api/live-inputs/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				type: event.data.get('liveinput_type'),
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			toast.error(`Error: ${error.message}`);
			return;
		}

		toast.success('Live Inputs imported');
		await invalidate('api:live-inputs');
	};
</script>

<svelte:head>
	<title>Live Inputs</title>
</svelte:head>

<Container>
	<h1>Live Inputs</h1>

	<div>
		<Button onclick={() => (openCreateModal = true)} class="cursor-pointer" size="xs">
			Create
		</Button>
	</div>

	<Table>
		<TableHead>
			<TableHeadCell>Name</TableHeadCell>
			<TableHeadCell>Type</TableHeadCell>
			<TableHeadCell>Status</TableHeadCell>
			<TableHeadCell>Actions</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each liveInputs as entry (entry.id)}
				<TableBodyRow>
					<TableBodyCell>{entry.name}</TableBodyCell>
					<TableBodyCell>
						{#if entry.type === 'ingest'}
							<Badge>Ingest</Badge>
						{:else if entry.type === 'return'}
							<Badge color="purple">Return</Badge>
						{:else}
							<Badge color="gray">Unknown</Badge>
						{/if}
					</TableBodyCell>
					<TableBodyCell>
						{#if entry.status == 'connected'}
							<Badge color="green" class="ml-2">Online</Badge>
						{:else if entry.status == 'disconnected'}
							<Badge color="red" class="ml-2">Offline</Badge>
						{:else if entry.status == 'error'}
							<Badge color="yellow" class="ml-2">Unknown</Badge>
						{/if}
					</TableBodyCell>
					<TableBodyCell class="flex gap-2">
						<Button size="xs" color="alternative" href="/live-inputs/{entry.id}"
							>View</Button
						>
						<Button
							type="button"
							class="cursor-pointer"
							size="xs"
							color="alternative"
							onclick={() => liveInputDeleteModals.set(entry.id, true)}>Delete</Button
						>

						{#if liveInputDeleteModals.get(entry.id)}
							<Modal
								form
								open
								title="Delete Live Input"
								oncancel={() => liveInputDeleteModals.set(entry.id, false)}
								onaction={async () => {
									await handleDelete(entry.id);
									liveInputImportModals.set(entry.id, false);
								}}
							>
								<p>Are you sure you want to delete "{entry.name}"?</p>

								{#snippet footer()}
									<Button
										type="submit"
										value="success"
										class="cursor-pointer"
										size="xs"
									>
										Delete
									</Button>
									<Button
										type="button"
										color="alternative"
										class="cursor-pointer"
										size="xs"
										onclick={() => liveInputImportModals.set(entry.id, false)}
									>
										Cancel
									</Button>
								{/snippet}
							</Modal>
						{/if}
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>

	<div class="flex gap-2">
		<h2>Pending Live Inputs</h2>
		<QuestionCircleSolid class="shrink-0 h-6 w-6" />
		<Tooltip class="max-w-xl">
			<p>
				These are live inputs that are present in Cloudflare but not yet in the database. A
				type, either <Badge>Ingest</Badge> or <Badge color="purple">Return</Badge>, must be
				assigned to them.
			</p>
		</Tooltip>
	</div>

	<div>
		<Button class="cursor-pointer" size="xs" onclick={handleSync}>Sync</Button>
	</div>

	<Table>
		<TableHead>
			<TableHeadCell>Name</TableHeadCell>
			<TableHeadCell>Type</TableHeadCell>
			<TableHeadCell>Status</TableHeadCell>
			<TableHeadCell>Actions</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each pendingLiveInputs as entry (entry.id)}
				<TableBodyRow>
					<TableBodyCell>{entry.name}</TableBodyCell>
					<TableBodyCell>
						{#if entry.type === 'ingest'}
							<Badge>Ingest</Badge>
						{:else if entry.type === 'return'}
							<Badge color="purple">Return</Badge>
						{:else}
							<Badge color="gray">Unknown</Badge>
						{/if}
					</TableBodyCell>
					<TableBodyCell>
						{#if entry.status == 'connected'}
							<Badge color="green" class="ml-2">Online</Badge>
						{:else if entry.status == 'disconnected'}
							<Badge color="red" class="ml-2">Offline</Badge>
						{:else if entry.status == 'error'}
							<Badge color="yellow" class="ml-2">Unknown</Badge>
						{/if}
					</TableBodyCell>
					<TableBodyCell class="flex gap-2">
						<Button
							type="button"
							class="cursor-pointer"
							size="xs"
							color="alternative"
							onclick={() => liveInputImportModals.set(entry.id, true)}>Import</Button
						>

						{#if liveInputImportModals.get(entry.id)}
							<Modal
								form
								open
								title="Import: {entry.name}"
								oncancel={() => liveInputImportModals.set(entry.id, false)}
								onaction={async (event) => {
									await handleImport(entry.id, event);
									liveInputImportModals.set(entry.id, false);
								}}
							>
								<div>
									<Label for="liveinput_type" class="mb-2">Type</Label>
									<Select
										name="liveinput_type"
										placeholder="Select a type"
										clearable
									>
										<option value="ingest">Ingest</option>
										<option value="return">Return</option>
									</Select>
								</div>

								{#snippet footer()}
									<Button
										type="submit"
										value="success"
										class="cursor-pointer"
										size="xs"
									>
										Import
									</Button>
									<Button
										type="button"
										color="alternative"
										class="cursor-pointer"
										size="xs"
										onclick={() => liveInputImportModals.set(entry.id, false)}
									>
										Cancel
									</Button>
								{/snippet}
							</Modal>
						{/if}
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
</Container>

<Modal form bind:open={openCreateModal} title="Create a Live Input" onaction={handleCreate}>
	<div>
		<Label for="liveinput_name" class="mb-2">Name</Label>
		<Input type="text" id="liveinput_name" name="liveinput_name" required />
	</div>

	<div>
		<Label for="liveinput_type" class="mb-2">Live Input Type</Label>
		<Select name="liveinput_type" placeholder="Select a type" clearable>
			<option value="ingest">Ingest</option>
			<option value="return">Return</option>
		</Select>
	</div>

	<div>
		<Label for="liveinput_description" class="mb-2">Description</Label>
		<Textarea id="liveinput_description" name="liveinput_description" class="w-full" />
	</div>

	{#snippet footer()}
		<Button type="submit" value="success" class="cursor-pointer" size="xs">Save</Button>
		<Button
			type="button"
			color="alternative"
			class="cursor-pointer"
			size="xs"
			onclick={() => (openCreateModal = false)}
		>
			Cancel
		</Button>
	{/snippet}
</Modal>
