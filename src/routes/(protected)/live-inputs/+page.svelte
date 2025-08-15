<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import {
		Alert,
		Badge,
		Button,
		Card,
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
	import InfoCircleSolid from 'flowbite-svelte-icons/InfoCircleSolid.svelte';
	import CheckCircleSolid from 'flowbite-svelte-icons/CheckCircleSolid.svelte';
	import type { PageProps } from './$types';
	import { invalidate } from '$app/navigation';

	let { data }: PageProps = $props();

	let liveInputs = $derived(data.liveInputs);
	let pendingLiveInputs = $derived(data.pendingLiveInputs);

	let liveinputErrorNotif = $state<string>();
	let syncErrorNotif = $state<string>();
	let syncSuccessNotif = $state<string>();

	let openCreateModal = $state(false);

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
		const response = await fetch('?/create', {
			method: 'POST',
			body: event.data,
		});

		if (response.ok) {
			liveinputErrorNotif = undefined;
		} else {
			const error = await response.json();
			liveinputErrorNotif = error.message;
			return;
		}

		await invalidate('api:live-inputs');
	};

	const handleDelete = async (id: string) => {
		const response = await fetch(`/api/live-inputs/${id}`, {
			method: 'DELETE',
		});

		if (response.ok) {
			liveinputErrorNotif = undefined;
		} else {
			const error = await response.json();
			liveinputErrorNotif = error.message;
			return;
		}

		await invalidate('api:live-inputs');
	};

	const handleSync = async () => {
		const response = await fetch(`/api/live-inputs/sync`, {
			method: 'POST',
		});

		if (response.ok) {
			syncErrorNotif = undefined;
			syncSuccessNotif = 'Live inputs synchronized.';
		} else {
			const error = await response.json();
			syncErrorNotif = error.message;
			return;
		}

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

		if (response.ok) {
			syncErrorNotif = undefined;
		} else {
			const error = await response.json();
			syncErrorNotif = error.message;
			return;
		}

		await invalidate('api:live-inputs');
	};
</script>

<svelte:head>
	<title>Live Inputs</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Live Inputs</h1>

	<div>
		<Button onclick={() => (openCreateModal = true)} class="cursor-pointer" size="xs">
			Create
		</Button>
	</div>

	{#if liveinputErrorNotif}
		<Alert color="red" dismissable onclick={() => (liveinputErrorNotif = undefined)}>
			{#snippet icon()}<InfoCircleSolid class="h-5 w-5" />{/snippet}
			{liveinputErrorNotif}
		</Alert>
	{/if}

	<Card class="overflow-hidden" size="xl">
		<Table>
			<TableHead>
				<TableHeadCell class="w-1/4">Name</TableHeadCell>
				<TableHeadCell class="w-1/4">Type</TableHeadCell>
				<TableHeadCell class="w-1/4">Status</TableHeadCell>
				<TableHeadCell class="w-1/4">Actions</TableHeadCell>
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
							{#if entry.status === 'connected'}
								<Badge color="green" class="ml-2">Online</Badge>
							{:else if entry.status === 'disconnected'}
								<Badge color="red" class="ml-2">Offline</Badge>
							{:else if entry.status === 'errored'}
								<Badge color="yellow" class="ml-2">Error</Badge>
							{:else}
								<Badge color="gray" class="ml-2">Unknown</Badge>
							{/if}
						</TableBodyCell>
						<TableBodyCell>
							<Button size="xs" color="alternative" href="/live-inputs/{entry.id}"
								>View</Button
							>
							<Button
								type="button"
								class="cursor-pointer"
								size="xs"
								color="alternative"
								onclick={() => liveInputDeleteModals.set(entry.id, true)}
								>Delete</Button
							>

							{#if liveInputDeleteModals.get(entry.id)}
								<Modal
									form
									open
									title="Delete Live Input"
									class="overflow-visible"
									classes={{ body: 'overflow-y-visible' }}
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
											onclick={() =>
												liveInputImportModals.set(entry.id, false)}
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
	</Card>

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

	{#if syncErrorNotif}
		<Alert color="red" dismissable onclick={() => (syncErrorNotif = undefined)}>
			{#snippet icon()}<InfoCircleSolid class="h-5 w-5" />{/snippet}
			{syncErrorNotif}
		</Alert>
	{/if}

	{#if syncSuccessNotif}
		<Alert color="green" dismissable onclick={() => (syncSuccessNotif = undefined)}>
			{#snippet icon()}<CheckCircleSolid class="h-5 w-5" />{/snippet}
			{syncSuccessNotif}
		</Alert>
	{/if}

	<Card class="overflow-hidden" size="xl">
		<Table>
			<TableHead>
				<TableHeadCell class="w-1/4">Name</TableHeadCell>
				<TableHeadCell class="w-1/4">Type</TableHeadCell>
				<TableHeadCell class="w-1/4">Status</TableHeadCell>
				<TableHeadCell class="w-1/4">Actions</TableHeadCell>
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
							{#if entry.status === 'connected'}
								<Badge color="green" class="ml-2">Online</Badge>
							{:else if entry.status === 'disconnected'}
								<Badge color="red" class="ml-2">Offline</Badge>
							{:else if entry.status === 'errored'}
								<Badge color="yellow" class="ml-2">Error</Badge>
							{:else}
								<Badge color="gray" class="ml-2">Unknown</Badge>
							{/if}
						</TableBodyCell>
						<TableBodyCell>
							<Button
								type="button"
								class="cursor-pointer"
								size="xs"
								color="alternative"
								onclick={() => liveInputImportModals.set(entry.id, true)}
							>
								Import
							</Button>

							{#if liveInputImportModals.get(entry.id)}
								<Modal
									form
									open
									title="Import: {entry.name}"
									class="overflow-visible"
									classes={{ body: 'overflow-y-visible' }}
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
											onclick={() =>
												liveInputImportModals.set(entry.id, false)}
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
	</Card>
</Container>

<Modal
	form
	title="Create a Live Input"
	class="overflow-visible"
	classes={{ body: 'overflow-y-visible' }}
	bind:open={openCreateModal}
	onaction={handleCreate}
>
	<div>
		<Label for="liveinput_name" class="mb-2">Name</Label>
		<Input type="text" id="liveinput_name" name="liveinput_name" required autocomplete="off" />
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
		<Textarea
			id="liveinput_description"
			name="liveinput_description"
			class="w-full"
			autocomplete="off"
		/>
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
