<script lang="ts">
	import Container from '$components/Container.svelte';
	import {
		Button,
		Input,
		Label,
		Modal,
		Skeleton,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
	} from 'flowbite-svelte';
	import type { PageProps } from './$types';
	import { invalidate } from '$app/navigation';

	let { data }: PageProps = $props();

	let liveInputs = $derived(data.liveInputs);
	let openCreateModal = $state(false);

	const handleCreate = async (event: { data: FormData }) => {
		const response = await fetch('/api/live-inputs', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: event.data.get('liveinput_name'),
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			alert(`Error: ${error.message}`);
			return;
		}

		await invalidate('/api/live-inputs');
	};

	const handleDelete = async (id: string) => {
		const response = await fetch(`/api/live-inputs/${id}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			const error = await response.json();
			alert(`Error: ${error.message}`);
			return;
		}

		await invalidate('/api/live-inputs');
	};
</script>

<svelte:head>
	<title>Live Inputs</title>
</svelte:head>

<Container>
	<h1>Live Inputs</h1>

	{#await liveInputs}
		<Skeleton size="2xl" />
	{:then liveInputs}
		<div>
			<Button onclick={() => (openCreateModal = true)} class="cursor-pointer">Create</Button>
		</div>

		<Table>
			<TableHead>
				<TableHeadCell>UID name</TableHeadCell>
				<TableHeadCell>Name</TableHeadCell>
				<TableHeadCell>Talent</TableHeadCell>
				<TableHeadCell>Scheduled for</TableHeadCell>
				<TableHeadCell>Actions</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each liveInputs ?? [] as entry (entry.uid)}
					<TableBodyRow>
						<TableBodyCell>{entry.uid}</TableBodyCell>
						<TableBodyCell>{(entry.meta as { name: string }).name}</TableBodyCell>
						<TableBodyCell></TableBodyCell>
						<TableBodyCell></TableBodyCell>
						<TableBodyCell class="flex gap-2">
							<Button size="xs" color="alternative" href="/live-inputs/{entry.uid}"
								>View</Button
							>
							<Button
								type="button"
								class="cursor-pointer"
								size="xs"
								color="alternative"
								onclick={() => handleDelete(entry.uid!)}>Delete</Button
							>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	{:catch error}
		<p style="color: red">{error.message}</p>
	{/await}
</Container>

<Modal
	form
	bind:open={openCreateModal}
	title="Create a Live Input"
	classes={{ body: 'h-32' }}
	onaction={handleCreate}
>
	<div>
		<Label for="liveinput_name" class="mb-2">Name</Label>
		<Input type="text" id="liveinput_name" name="liveinput_name" required />
	</div>

	{#snippet footer()}
		<Button type="submit" value="success" class="cursor-pointer">Save</Button>
		<Button
			type="button"
			color="alternative"
			class="cursor-pointer"
			onclick={() => (openCreateModal = false)}
		>
			Cancel
		</Button>
	{/snippet}
</Modal>
