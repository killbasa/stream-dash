<script lang="ts">
	import Container from '$components/Container.svelte';
	import { toast } from '$lib/client/stores/toasts';
	import {
		Button,
		Card,
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
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { goto, invalidate } from '$app/navigation';

	const formatter = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	});

	let { data }: PageProps = $props();

	let talent = $derived(page.url.searchParams.get('talent'));
	let blocks = $derived(
		data.blocks
			.filter((block) => {
				if (!talent) return true;

				return block.talents.some((t) => t.id === talent);
			})
			.filter((block) => {
				const location = page.url.searchParams.get('location');
				if (!location) return true;

				return block.location?.id === location;
			}),
	);

	const blockDeleteModals = $derived(
		new SvelteMap<string, boolean>(
			blocks.reduce((acc, block) => {
				acc.set(block.id, false);
				return acc;
			}, new Map<string, boolean>()),
		),
	);

	const handleDelete = async (id: string) => {
		const response = await fetch(`/api/blocks/${id}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			const error = await response.json();
			toast.error(`Error: ${error.message}`);
			return;
		}

		toast.success('Block deleted');
		await invalidate('api:blocks');
	};
</script>

<svelte:head>
	<title>Blocks</title>
</svelte:head>

<Container>
	<h1>Blocks</h1>

	<div>
		<Button href="/blocks/create" class="cursor-pointer" size="xs">Create</Button>
	</div>

	<Card class="p-4" size="xl">
		<div class="grid grid-cols-2 md:grid-cols-3 gap-2">
			<Select
				placeholder="Filter by Talent"
				items={data.talents.map((talent) => ({ value: talent.id, name: talent.name }))}
				clearable
				onchange={(event) => {
					const params = new URLSearchParams(page.url.searchParams);

					if (event.currentTarget.value) {
						params.set('talent', event.currentTarget.value);
					} else {
						params.delete('talent');
					}

					goto(`/blocks?${params}`);
				}}
			/>
			<Select
				placeholder="Filter by Location"
				items={data.locations.map((location) => ({
					value: location.id,
					name: location.name,
				}))}
				clearable
				onchange={(event) => {
					const params = new URLSearchParams(page.url.searchParams);

					if (event.currentTarget.value) {
						params.set('location', event.currentTarget.value);
					} else {
						params.delete('location');
					}

					goto(`/blocks?${params}`);
				}}
			/>
		</div>
	</Card>

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
			{#each blocks ?? [] as entry (entry.id)}
				<TableBodyRow>
					<TableBodyCell>{entry.name}</TableBodyCell>
					<TableBodyCell>
						<div class="flex flex-col gap-1">
							{#each entry.talents as talent (talent.id)}
								<a class="underline" href="/talents/{talent.id}">{talent.name}</a>
							{/each}
						</div>
					</TableBodyCell>
					<TableBodyCell>{entry.location?.name ?? 'Unknown'}</TableBodyCell>
					<TableBodyCell
						>{entry.start ? formatter.format(entry.start) : 'Unknown'}</TableBodyCell
					>
					<TableBodyCell
						>{entry.end ? formatter.format(entry.end) : 'Unknown'}</TableBodyCell
					>
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
</Container>
