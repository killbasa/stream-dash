<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import PlaceholderAvatar from '$components/PlaceholderAvatar.svelte';
	import {
		Button,
		Input,
		Label,
		Modal,
		Fileupload,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Textarea,
		Helper,
		Avatar,
		Card,
		Alert,
	} from 'flowbite-svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import InfoCircleSolid from 'flowbite-svelte-icons/InfoCircleSolid.svelte';
	import type { PageProps } from './$types';
	import { invalidate } from '$app/navigation';

	let { data }: PageProps = $props();

	let talents = $derived(data.talents);

	let errorNotif = $state<string>();

	let openCreateModal = $state(false);

	const talentDeleteModals = $derived(
		new SvelteMap<string, boolean>(
			talents.reduce((acc, talent) => {
				acc.set(talent.id, false);
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

		await invalidate('api:talents');
	};

	const handleDelete = async (id: string) => {
		const response = await fetch(`/api/talents/${id}`, {
			method: 'DELETE',
		});

		if (response.ok) {
			errorNotif = undefined;
		} else {
			const error = await response.json();
			errorNotif = error.message;
			return;
		}

		await invalidate('api:talents');
	};
</script>

<svelte:head>
	<title>Talents</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Talents</h1>

	{#if errorNotif}
		<Alert color="red" dismissable>
			{#snippet icon()}<InfoCircleSolid class="h-5 w-5" />{/snippet}
			{errorNotif}
		</Alert>
	{/if}

	<div>
		<Button onclick={() => (openCreateModal = true)} class="cursor-pointer" size="xs"
			>Create</Button
		>
	</div>

	<Card class="overflow-hidden" size="xl">
		<Table>
			<TableHead>
				<TableHeadCell></TableHeadCell>
				<TableHeadCell class="w-3/4">Name</TableHeadCell>
				<TableHeadCell class="w-1/4">Actions</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each talents as entry (entry.id)}
					<TableBodyRow>
						<TableBodyCell class="w-18 pr-0 block">
							{#if entry.imageUrl}
								<Avatar src={entry.imageUrl} class="w-12 h-12 rounded-full" />
							{:else}
								<PlaceholderAvatar />
							{/if}
						</TableBodyCell>
						<TableBodyCell>{entry.name}</TableBodyCell>
						<TableBodyCell>
							<Button size="xs" color="alternative" href="/talents/{entry.id}"
								>View</Button
							>
							<Button size="xs" color="alternative" href="/blocks?talent={entry.id}"
								>Blocks</Button
							>
							<Button
								type="button"
								class="cursor-pointer"
								size="xs"
								color="alternative"
								onclick={() => talentDeleteModals.set(entry.id, true)}
								>Delete</Button
							>

							{#if talentDeleteModals.get(entry.id)}
								<Modal
									form
									open
									title="Delete talent"
									class="overflow-visible"
									classes={{ body: 'overflow-y-visible' }}
									oncancel={() => talentDeleteModals.set(entry.id, false)}
									onaction={async () => {
										await handleDelete(entry.id);
										talentDeleteModals.set(entry.id, false);
									}}
								>
									<p>Are you sure you want to delete "{entry.name}"?</p>

									{#snippet footer()}
										<Button
											size="xs"
											type="submit"
											value="success"
											class="cursor-pointer"
										>
											Delete
										</Button>
										<Button
											size="xs"
											type="button"
											color="alternative"
											class="cursor-pointer"
											onclick={() => talentDeleteModals.set(entry.id, false)}
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
	title="Create a Talent"
	class="overflow-visible"
	classes={{ body: 'overflow-y-visible' }}
	bind:open={openCreateModal}
	onaction={handleCreate}
>
	<div>
		<Label for="talent_name" class="mb-2">Name</Label>
		<Input type="text" id="talent_name" name="talent_name" required autocomplete="off" />
	</div>

	<div>
		<Label for="talent_description" class="mb-2">Description</Label>
		<Textarea
			id="talent_description"
			name="talent_description"
			class="w-full"
			autocomplete="off"
		/>
	</div>

	<div>
		<Label for="talent_image" class="mb-2">Image</Label>
		<Fileupload id="talent_image" name="talent_image" accept="image/*" class="mb-2" />
		<Helper>SVG, PNG, JPG or GIF.</Helper>
	</div>

	{#snippet footer()}
		<Button size="xs" type="submit" value="success" class="cursor-pointer">Save</Button>
		<Button
			size="xs"
			type="button"
			color="alternative"
			class="cursor-pointer"
			onclick={() => (openCreateModal = false)}
		>
			Cancel
		</Button>
	{/snippet}
</Modal>
