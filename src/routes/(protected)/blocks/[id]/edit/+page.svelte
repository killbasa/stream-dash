<script lang="ts">
	import Container from '$components/Container.svelte';
	import { toast } from '$lib/client/stores/toasts';
	import {
		Button,
		Card,
		Datepicker,
		Input,
		Label,
		MultiSelect,
		Select,
		Timepicker,
	} from 'flowbite-svelte';
	import type { PageProps, SubmitFunction } from './$types';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let { data }: PageProps = $props();

	let start_time = $state<string>(new Date(data.block.start).toTimeString().slice(0, 5));
	let end_time = $state<string>(new Date(data.block.end).toTimeString().slice(0, 5));
	let start_date = $state<Date | undefined>(undefined);
	let end_date = $state<Date | undefined>(undefined);

	const handleEdit: SubmitFunction = (event) => {
		if (start_date && start_time) {
			const start_temp = new Date(start_date);
			start_temp.setHours(
				Number(start_time?.split(':')[0]),
				Number(start_time?.split(':')[1]),
				0,
			);
			event.formData.set('block_start', start_temp.getTime().toString());
		}

		if (end_date && end_time) {
			const end_temp = new Date(end_date);
			end_temp.setHours(
				Number(end_time?.split(':')[0]), //
				Number(end_time?.split(':')[1]),
				0,
			);
			event.formData.set('block_end', end_temp.getTime().toString());
		}

		return async function ({ result }) {
			if (result.type === 'failure') {
				console.error('Error updating block:', result.data?.errors);
				toast.error('Error updating block');
				return;
			}

			if (result.type === 'error') {
				console.error('Error updating block:', result.error);
				toast.error('Error updating block');
				return;
			}

			toast.success('Block updated');
			await goto('/blocks');
		};
	};
</script>

<svelte:head>
	<title>Create | Blocks</title>
</svelte:head>

<Container>
	<h1>Edit Block</h1>

	<form method="POST" action="?/update" use:enhance={handleEdit}>
		<Card class="p-4 gap-4" size="xl">
			<div>
				<Label for="block_name" class="mb-2">Name</Label>
				<Input
					type="text"
					id="block_name"
					name="block_name"
					value={data.block.name}
					required
				/>
			</div>

			<div>
				<Label class="mb-2">Date range:</Label>
				<Datepicker
					range
					rangeFrom={data.block.start ? new Date(data.block.start) : undefined}
					rangeTo={data.block.end ? new Date(data.block.end) : undefined}
					onselect={(detail) => {
						if (detail instanceof Date) {
							start_date = detail;
						} else {
							start_date = detail.from;
							end_date = detail.to;
						}
					}}
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<Label for="block_start" class="mb-2">Start time:</Label>
					<Timepicker id="block_start" divClass="w-full" value={start_time} />
				</div>

				<div>
					<Label for="block_end" class="mb-2">End time:</Label>
					<Timepicker id="block_end" divClass="w-full" bind:value={end_time} />
				</div>
			</div>

			<div>
				<Label for="block_talents" class="mb-2">Talents</Label>
				<MultiSelect
					name="block_talents"
					items={data.talents.map((talent) => ({ value: talent.id, name: talent.name }))}
					value={data.block.talents.map((talent) => talent.id)}
					required
				/>
			</div>

			<div>
				<Label for="block_location" class="mb-2">Location</Label>
				<Select
					name="block_location"
					items={data.locations.map((location) => ({
						value: location.id,
						name: location.name,
					}))}
					value={data.block.locationId}
					required
				/>
			</div>

			<div>
				<Label for="block_ingest" class="mb-2">Ingest Feed</Label>
				<Select
					name="block_ingest"
					placeholder="Select a Live Input"
					value={data.block.ingestLiveInputId}
					clearable
					required
				>
					{#each data.ingestLiveInputs as input}
						<option value={input.id}>{input.name}</option>
					{/each}
				</Select>
			</div>

			<div>
				<Label for="block_return" class="mb-2">Return Feed</Label>
				<Select
					name="block_return"
					placeholder="Select a Live Input"
					value={data.block.playbackLiveInputId}
					clearable
				>
					{#each data.returnLiveInputs as input}
						<option value={input.id}>{input.name}</option>
					{/each}
				</Select>
			</div>

			<div>
				<Button type="submit" size="xs">Save</Button>
			</div>
		</Card>
	</form>
</Container>
