<script lang="ts">
	import Container from '$components/Container.svelte';
	import { ReadableScopes } from '$lib/client/constants';
	import { Card, Input, Label, MultiSelect, Select } from 'flowbite-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.user.name} | Users</title>
</svelte:head>

<Container>
	<h1>{data.user.name}</h1>

	<Card class="p-4 gap-4" size="xl">
		<div>
			<Label for="user_name" class="mb-2">Name</Label>
			<Input type="text" id="user_name" value={data.user.name} disabled />
		</div>

		<div>
			<Label for="user_email" class="mb-2">Email</Label>
			<Input type="email" id="user_email" value={data.user.email} disabled />
		</div>

		<div>
			<Label for="user_role" class="mb-2">Role</Label>
			<Select name="user_role" placeholder="Select a role" value={data.user.role} disabled>
				<option value="admin">Admin</option>
				<option value="editor">User</option>
			</Select>
		</div>

		<div>
			<Label for="user_scopes" class="mb-2">Scopes</Label>
			<MultiSelect
				id="user_scopes"
				items={ReadableScopes}
				value={data.user.scopes}
				disabled
			/>
		</div>
	</Card>
</Container>
