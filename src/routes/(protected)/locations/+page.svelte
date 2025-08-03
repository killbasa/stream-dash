<script lang="ts">
	import Container from '$components/Container.svelte';
	import { toast } from '$lib/client/stores/toasts';
	import {
		Button,
		Input,
		Label,
		Modal,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Textarea,
	} from 'flowbite-svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import type { PageProps } from './$types';
	import { invalidate } from '$app/navigation';

	let { data }: PageProps = $props();

	let locations = $derived(data.locations);
	let openCreateModal = $state(false);

	const locationDeleteModals = $derived(
		new SvelteMap<string, boolean>(
			locations.reduce((acc, location) => {
				acc.set(location.id, false);
				return acc;
			}, new Map<string, boolean>()),
		),
	);

	const handleCreate = async (event: { data: FormData }) => {
		const response = await fetch('/api/locations', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: event.data.get('location_name'),
				description: event.data.get('location_description'),
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			toast.error(`Error: ${error.message}`);
			return;
		}

		toast.success('Location created');
		await invalidate('api:locations');
	};

	const handleDelete = async (id: string) => {
		const response = await fetch(`/api/locations/${id}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			const error = await response.json();
			toast.error(`Error: ${error.message}`);
			return;
		}

		toast.success('Location deleted');
		await invalidate('api:locations');
	};
</script>

<svelte:head>
	<title>Locations</title>
</svelte:head>

<Container>
	<h1>Locations</h1>

	<div>
		<Button onclick={() => (openCreateModal = true)} class="cursor-pointer" size="xs"
			>Create</Button
		>
		<Modal form bind:open={openCreateModal} title="Create a location" onaction={handleCreate}>
			<div>
				<Label for="location_name">Name</Label>
				<Input type="text" id="location_name" name="location_name" required />
			</div>

			<div>
				<Label for="location_description" class="mb-2">Description</Label>
				<Textarea id="location_description" name="location_description" class="w-full" />
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
	</div>

	<Table>
		<TableHead>
			<TableHeadCell>Name</TableHeadCell>
			<TableHeadCell>Actions</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each locations as entry (entry.id)}
				<TableBodyRow>
					<TableBodyCell>{entry.name}</TableBodyCell>
					<TableBodyCell>
						<Button size="xs" color="alternative" href="/blocks?location={entry.id}"
							>Blocks</Button
						>
						<Button
							type="button"
							class="cursor-pointer"
							size="xs"
							color="alternative"
							onclick={() => locationDeleteModals.set(entry.id, true)}>Delete</Button
						>

						{#if locationDeleteModals.get(entry.id)}
							<Modal
								form
								open
								title="Delete location"
								oncancel={() => locationDeleteModals.set(entry.id, false)}
								onaction={async () => {
									await handleDelete(entry.id);
									locationDeleteModals.set(entry.id, false);
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
										onclick={() => locationDeleteModals.set(entry.id, false)}
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
