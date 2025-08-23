<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Card,
		Button,
		Modal,
		Label,
		Input,
		Alert,
		Select,
	} from 'flowbite-svelte';
	import InfoCircleSolid from 'flowbite-svelte-icons/InfoCircleSolid.svelte';
	import type { PageProps } from './$types';
	import { invalidate } from '$app/navigation';

	let { data, params }: PageProps = $props();

	let members = $derived(data.members.members);

	let errorNotif = $state<string>();

	let openInviteModal = $state(false);

	const handleAdd = async (event: { data: FormData }) => {
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

		await invalidate('api:members');
	};
</script>

<svelte:head>
	<title>Members | {params.orgSlug}</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Members</h1>

	<div>
		<Button onclick={() => (openInviteModal = true)} class="cursor-pointer" size="xs"
			>Add</Button
		>
		<Modal
			form
			title="Add a member"
			class="overflow-visible"
			classes={{ body: 'overflow-y-visible' }}
			bind:open={openInviteModal}
			onaction={handleAdd}
		>
			<div>
				<Label for="member_email" class="mb-1">Email</Label>
				<Input
					type="text"
					id="member_email"
					name="member_email"
					required
					autocomplete="off"
				/>
			</div>

			<div>
				<Label for="member_role" class="mb-1">Role</Label>
				<Select id="member_role" name="member_role" placeholder="Select a role" clearable>
					<option value="admin">Admin</option>
					<option value="editor">Editor</option>
					<option value="member">Member</option>
				</Select>
			</div>

			{#snippet footer()}
				<Button type="submit" value="success" class="cursor-pointer" size="xs">Save</Button>
				<Button
					type="button"
					color="alternative"
					class="cursor-pointer"
					size="xs"
					onclick={() => (openInviteModal = false)}
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
				<TableHeadCell class="w-1/4">Name</TableHeadCell>
				<TableHeadCell class="w-1/4">Email</TableHeadCell>
				<TableHeadCell class="w-1/4">Role</TableHeadCell>
				<TableHeadCell class="w-1/4">Actions</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each members as entry (entry.id)}
					<TableBodyRow>
						<TableBodyCell>{entry.user.name}</TableBodyCell>
						<TableBodyCell>{entry.user.email}</TableBodyCell>
						<TableBodyCell>{entry.role}</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</Card>
</Container>
