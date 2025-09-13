<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import { updateParams } from '$src/lib/client/utils';
	import {
		Alert,
		Button,
		Card,
		Input,
		Modal,
		Select,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
	} from 'flowbite-svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import InfoCircleSolid from 'flowbite-svelte-icons/InfoCircleSolid.svelte';
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { invalidate } from '$app/navigation';

	const formatter = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	});

	let { data }: PageProps = $props();

	let name_filter: string = $derived(page.url.searchParams.get('name') ?? '');
	let talent_filter: string = $derived(page.url.searchParams.get('talent') ?? '');
	let location_filter: string = $derived(page.url.searchParams.get('location') ?? '');

	let blocks = $derived(
		data.blocks
			.filter((block) => {
				if (!name_filter) return true;

				return block.name.toLowerCase().includes(name_filter.toLowerCase());
			})
			.filter((block) => {
				if (!talent_filter) return true;

				return block.talents.some((t) => t.id === talent_filter);
			})
			.filter((block) => {
				const location = page.url.searchParams.get('location');
				if (!location) return true;

				return block.location?.id === location;
			}),
	);

	let errorNotif = $state<string>();

	const blockDeleteModals = $derived(
		new SvelteMap<string, boolean>(
			blocks.reduce((acc, block) => {
				acc.set(block.id, false);
				return acc;
			}, new Map<string, boolean>()),
		),
	);

	const handleDelete = async (id: string) => {
		const response = await fetch(`/api/$blocks/${id}`, {
			method: 'DELETE',
		});

		if (response.ok) {
			errorNotif = undefined;
		} else {
			const error = await response.json();
			errorNotif = error.message;
			return;
		}

		await invalidate('api:blocks');
	};
</script>

<svelte:head>
	<title>Blocks</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Blocks</h1>

	<div>
		<Button href="/blocks/new" class="cursor-pointer" size="xs">Create</Button>
	</div>

	{#if errorNotif}
		<Alert color="red" dismissable onclick={() => (errorNotif = undefined)}>
			{#snippet icon()}<InfoCircleSolid class="h-5 w-5" />{/snippet}
			{errorNotif}
		</Alert>
	{/if}

	<Card class="p-4" size="xl">
		<div class="grid grid-cols-2 md:grid-cols-3 gap-2">
			<Input
				type="text"
				placeholder="Filter by name"
				bind:value={name_filter}
				autocomplete="off"
			/>
			<Select
				placeholder="Filter by talent"
				items={data.talents.map((talent) => ({ value: talent.id, name: talent.name }))}
				clearable
				value={talent_filter}
				onchange={async (event) => {
					await updateParams('talent', event.currentTarget.value);
				}}
			/>
			<Select
				placeholder="Filter by location"
				items={data.locations.map((location) => ({
					value: location.id,
					name: location.name,
				}))}
				clearable
				value={location_filter}
				onchange={async (event) => {
					await updateParams('location', event.currentTarget.value);
				}}
			/>
		</div>
	</Card>

	<Card class="overflow-hidden" size="xl">
		<Table>
			<TableHead>
				<TableHeadCell>Name</TableHeadCell>
				<TableHeadCell>Talents</TableHeadCell>
				<TableHeadCell>Location</TableHeadCell>
				<TableHeadCell>Start</TableHeadCell>
				<TableHeadCell>End</TableHeadCell>
				<TableHeadCell>Links</TableHeadCell>
				<TableHeadCell>Actions</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each blocks as entry (entry.id)}
					<TableBodyRow>
						<TableBodyCell>{entry.name}</TableBodyCell>
						<TableBodyCell>
							<div class="flex flex-col gap-1">
								{#each entry.talents as talent (talent.id)}
									<a class="underline" href="/talents/{talent.id}"
										>{talent.name}</a
									>
								{/each}
							</div>
						</TableBodyCell>
						<TableBodyCell>
							{#if entry.location}
								<a class="underline" href="/locations/{entry.location.id}"
									>{entry.location.name}</a
								>
							{:else}
								<span class="text-gray-500">Unknown</span>
							{/if}
						</TableBodyCell>
						<TableBodyCell>
							{#if entry.start}
								<span>{formatter.format(entry.start)}</span>
							{:else}
								<span class="text-gray-500">Unknown</span>
							{/if}
						</TableBodyCell>
						<TableBodyCell>
							{#if entry.end}
								<span>{formatter.format(entry.end)}</span>
							{:else}
								<span class="text-gray-500">Unknown</span>
							{/if}
						</TableBodyCell>
						<TableBodyCell>
							<Button
								size="xs"
								color="alternative"
								href={entry.ingestLiveInputId
									? `/live-inputs/${entry.ingestLiveInputId}`
									: undefined}
								disabled={!entry.ingestLiveInputId}>Ingest</Button
							>
							<Button
								size="xs"
								color="alternative"
								href={entry.playbackLiveInputId
									? `/live-inputs/${entry.playbackLiveInputId}`
									: undefined}
								disabled={!entry.playbackLiveInputId}>Return</Button
							>
						</TableBodyCell>
						<TableBodyCell>
							<Button
								href="/blocks/{entry.id}"
								size="xs"
								color="alternative"
								class="cursor-pointer">View</Button
							>
							<Button
								href="/blocks/{entry.id}/edit"
								size="xs"
								color="alternative"
								class="cursor-pointer">Edit</Button
							>
							<Button
								size="xs"
								color="alternative"
								class="cursor-pointer"
								onclick={() => blockDeleteModals.set(entry.id, true)}>Delete</Button
							>

							{#if blockDeleteModals.get(entry.id)}
								<Modal
									form
									open
									title="Delete talent"
									class="overflow-visible"
									classes={{ body: 'overflow-y-visible' }}
									oncancel={() => blockDeleteModals.set(entry.id, false)}
									onaction={async () => {
										await handleDelete(entry.id);
										blockDeleteModals.set(entry.id, false);
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
											onclick={() => blockDeleteModals.set(entry.id, false)}
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
