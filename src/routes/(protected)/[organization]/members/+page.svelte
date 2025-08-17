<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import {
		Button,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Card,
	} from 'flowbite-svelte';
	import type { PageProps } from './$types';

	let { data, params }: PageProps = $props();

	let members = $derived(data.members);
</script>

<svelte:head>
	<title>Users | {params.organization}</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Users</h1>

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
						<TableBodyCell>
							<Button
								href="/{params.organization}/members/{entry.id}"
								size="xs"
								type="button"
								class="cursor-pointer"
								color="alternative"
							>
								View
							</Button>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</Card>
</Container>
