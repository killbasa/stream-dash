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
	} from 'flowbite-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let organizations = $derived(data.organizations);
</script>

<svelte:head>
	<title>Organizations | Admin</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Organizations</h1>

	<div>
		<Button href="/admin/organizations/new" size="xs" class="cursor-pointer">Create</Button>
	</div>

	<Card class="overflow-hidden" size="xl">
		<Table>
			<TableHead>
				<TableHeadCell class="w-3/4">Name</TableHeadCell>
				<TableHeadCell class="w-1/4">Actions</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each organizations as entry (entry.id)}
					<TableBodyRow>
						<TableBodyCell>{entry.name}</TableBodyCell>
						<TableBodyCell>
							<Button
								size="xs"
								color="alternative"
								href="/admin/organizations/{entry.id}">View</Button
							>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</Card>
</Container>
