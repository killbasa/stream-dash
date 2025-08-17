<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import { Card, Input, Label, Select } from 'flowbite-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.user.name} | Users</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Users</h1>

	<Card class="p-4 gap-4" size="xl">
		<div>
			<Label for="user_name" class="mb-2">Name</Label>
			<Input type="text" id="user_name" value={data.user.name} disabled autocomplete="off" />
		</div>

		<div>
			<Label for="user_email" class="mb-2">Email</Label>
			<Input
				type="email"
				id="user_email"
				value={data.user.email}
				disabled
				autocomplete="off"
			/>
		</div>

		<div>
			<Label for="user_role" class="mb-2">Role</Label>
			<Select name="user_role" placeholder="Select a role" value={data.user.role} disabled>
				<option value="superadmin">Superadmin</option>
				<option value="admin">Admin</option>
				<option value="user">User</option>
			</Select>
		</div>

		<div class="mt-2 space-x-1 text-xs opacity-75">
			<span>ID: {data.user.id}</span>
		</div>
	</Card>
</Container>
