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
	} from 'flowbite-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let sessions = $derived(data.sessions);
</script>

<svelte:head>
	<title>Sessions | Admin</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Sessions</h1>

	<Card class="overflow-hidden" size="xl">
		<Table>
			<TableHead>
				<TableHeadCell class="w-1/4">ID</TableHeadCell>
				<TableHeadCell class="w-1/4">User ID</TableHeadCell>
				<TableHeadCell class="w-1/4">Created</TableHeadCell>
				<TableHeadCell class="w-1/4">Expires</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each sessions as entry (entry.id)}
					<TableBodyRow>
						<TableBodyCell>{entry.id}</TableBodyCell>
						<TableBodyCell>{entry.userId}</TableBodyCell>
						<TableBodyCell>{entry.createdAt.toISOString()}</TableBodyCell>
						<TableBodyCell>{entry.expiresAt.toISOString()}</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</Card>
</Container>
