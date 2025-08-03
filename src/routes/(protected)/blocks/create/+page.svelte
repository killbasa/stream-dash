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

	let start_time = $state<string>('00:00');
	let end_time = $state<string>('00:00');
	let start_date = $state<Date | undefined>(undefined);
	let end_date = $state<Date | undefined>(undefined);

	const handleCreate: SubmitFunction = (event) => {
		if (start_date && start_time) {
			const start_temp = new Date(start_date);
			start_temp.setHours(
				Number(start_time?.split(':')[0]),
				Number(start_time?.split(':')[1]),
				0,
			);
			event.formData.set('block_start_time', start_temp.getTime().toString());
		}

		if (end_date && end_time) {
			const end_temp = new Date(end_date);
			end_temp.setHours(
				Number(end_time?.split(':')[0]), //
				Number(end_time?.split(':')[1]),
				0,
			);
			event.formData.set('block_end_time', end_temp.getTime().toString());
		}

		return async function ({ result }) {
			if (result.type === 'failure') {
				console.error('Error creating block:', result.data?.errors);
				toast.error('Error creating block');
				return;
			}

			if (result.type === 'error') {
				console.error('Error creating block:', result.error);
				toast.error('Error creating block');
				return;
			}

			toast.success('Block created');
			await goto('/blocks');
		};
	};
</script>

<svelte:head>
	<title>Create | Blocks</title>
</svelte:head>

<Container>
	<h1>Create Block</h1>

	<form method="POST" action="?/create" use:enhance={handleCreate}>
		<Card class="p-4 gap-4" size="xl">
			<div>
				<Label for="block_name" class="mb-2">Name</Label>
				<Input type="text" id="block_name" name="block_name" required />
			</div>

			<div>
				<Label class="mb-2">Date range:</Label>
				<Datepicker
					range
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
					<Label for="block_start_time" class="mb-2">Start time:</Label>
					<Timepicker id="block_start_time" divClass="w-full" value={start_time} />
				</div>

				<div>
					<Label for="block_end_time" class="mb-2">End time:</Label>
					<Timepicker id="block_end_time" divClass="w-full" bind:value={end_time} />
				</div>
			</div>

			<div>
				<Label for="block_talents" class="mb-2">Talents</Label>
				<MultiSelect
					name="block_talents"
					items={data.talents.map((talent) => ({ value: talent.id, name: talent.name }))}
					value={[]}
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
					required
				/>
			</div>

			<div>
				<Label for="block_ingest" class="mb-2">Ingest Feed</Label>
				<Select name="block_ingest" placeholder="Select a Live Input" clearable required>
					{#each data.ingestLiveInputs as input}
						<option value={input.id}>{input.name}</option>
					{/each}
				</Select>
			</div>

			<div>
				<Label for="block_return" class="mb-2">Return Feed</Label>
				<Select name="block_return" placeholder="Select a Live Input" clearable>
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
