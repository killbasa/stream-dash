<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import {
		Alert,
		Button,
		Card,
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
	import InfoCircleSolid from 'flowbite-svelte-icons/InfoCircleSolid.svelte';
	import type { PageProps } from './$types';
	import { invalidate } from '$app/navigation';

	let { data, params }: PageProps = $props();

	let locations = $derived(data.locations);

	let errorNotif = $state<string>();

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
		const response = await fetch('?/create', {
			method: 'POST',
			body: event.data,
		});

		if (response.ok) {
			errorNotif = undefined;
		} else {
			const error = await response.json();
			errorNotif = error.message;
			return;
		}

		await invalidate('api:locations');
	};

	const handleDelete = async (id: string) => {
		const response = await fetch(`/api/${params.orgSlug}/locations/${id}`, {
			method: 'DELETE',
		});

		if (response.ok) {
			errorNotif = undefined;
		} else {
			const error = await response.json();
			errorNotif = error.message;
			return;
		}

		await invalidate('api:locations');
	};
</script>

<svelte:head>
	<title>Locations | {params.orgSlug}</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Locations</h1>

	<div>
		<Button onclick={() => (openCreateModal = true)} class="cursor-pointer" size="xs"
			>Create</Button
		>
		<Modal
			form
			title="Create a location"
			class="overflow-visible"
			classes={{ body: 'overflow-y-visible' }}
			bind:open={openCreateModal}
			onaction={handleCreate}
		>
			<div>
				<Label for="location_name" class="mb-1">Name</Label>
				<Input
					type="text"
					id="location_name"
					name="location_name"
					required
					autocomplete="off"
				/>
			</div>

			<div>
				<Label for="location_description" class="mb-1">Description</Label>
				<Textarea
					id="location_description"
					name="location_description"
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
	</div>

	{#if errorNotif}
		<Alert color="red" dismissable onclick={() => (errorNotif = undefined)}>
			{#snippet icon()}<InfoCircleSolid class="h-5 w-5" />{/snippet}
			{errorNotif}
		</Alert>
	{/if}

	<Card class="overflow-hidden" size="xl">
		<Table>
			<TableHead>
				<TableHeadCell class="w-3/4">Name</TableHeadCell>
				<TableHeadCell class="w-1/4">Actions</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each locations as entry (entry.id)}
					<TableBodyRow>
						<TableBodyCell>{entry.name}</TableBodyCell>
						<TableBodyCell>
							<Button
								size="xs"
								color="alternative"
								href="/{params.orgSlug}/locations/{entry.id}">View</Button
							>
							<Button
								size="xs"
								color="alternative"
								href="/{params.orgSlug}/blocks?location={entry.id}">Blocks</Button
							>
							<Button
								type="button"
								class="cursor-pointer"
								size="xs"
								color="alternative"
								onclick={() => locationDeleteModals.set(entry.id, true)}
								>Delete</Button
							>

							{#if locationDeleteModals.get(entry.id)}
								<Modal
									form
									open
									title="Delete location"
									class="overflow-visible"
									classes={{ body: 'overflow-y-visible' }}
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
											onclick={() =>
												locationDeleteModals.set(entry.id, false)}
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
