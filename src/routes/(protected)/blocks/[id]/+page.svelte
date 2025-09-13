<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import {
		Card,
		Label,
		Input,
		Datepicker,
		Timepicker,
		MultiSelect,
		Select,
	} from 'flowbite-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.block.name} | Blocks</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Blocks</h1>

	<Card class="p-4 gap-4" size="xl">
		<div>
			<Label for="block_name" class="mb-1">Name</Label>
			<Input
				type="text"
				id="block_name"
				name="block_name"
				value={data.block.name}
				disabled
				autocomplete="off"
			/>
		</div>

		<div>
			<Label for="block_date_range" class="mb-1">Date range</Label>
			<Datepicker
				id="block_date_range"
				range
				rangeFrom={new Date(data.block.start)}
				rangeTo={new Date(data.block.end)}
				disabled
			/>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<Label for="block_start" class="mb-1">Start time</Label>
				<Timepicker
					id="block_start"
					divClass="w-full"
					value={new Date(data.block.start).toTimeString().slice(0, 5)}
					disabled
				/>
			</div>

			<div>
				<Label for="block_end" class="mb-1">End time</Label>
				<Timepicker
					id="block_end"
					divClass="w-full"
					value={new Date(data.block.end).toTimeString().slice(0, 5)}
					disabled
				/>
			</div>
		</div>

		<div>
			<Label for="block_talents" class="mb-1">Talents</Label>
			<MultiSelect
				name="block_talents"
				items={data.talents.map((talent) => ({ value: talent.id, name: talent.name }))}
				value={data.block.talents.map((talent) => talent.id)}
				disabled
			/>
		</div>

		<div>
			<Label for="block_location" class="mb-1">Location</Label>
			<Select
				name="block_location"
				items={data.locations.map((location) => ({
					value: location.id,
					name: location.name,
				}))}
				value={data.block.locationId}
				disabled
			/>
		</div>

		<div>
			<Label for="block_ingest" class="mb-1">Ingest Feed</Label>
			<Select
				name="block_ingest"
				placeholder="Select a Live Input"
				value={data.block.ingestLiveInputId}
				disabled
			>
				{#each data.ingestLiveInputs as input}
					<option value={input.id}>{input.name}</option>
				{/each}
			</Select>
		</div>

		<div>
			<Label for="block_return" class="mb-1">Return Feed</Label>
			<Select
				name="block_return"
				placeholder="Select a Live Input"
				value={data.block.playbackLiveInputId}
				disabled
			>
				{#each data.returnLiveInputs as input}
					<option value={input.id}>{input.name}</option>
				{/each}
			</Select>
		</div>

		<div class="mt-2 space-x-1 text-xs opacity-75">
			<span>ID: {data.block.id}</span>
		</div>
	</Card>
</Container>
