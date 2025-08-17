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
		<Button size="xs" onclick={() => console.log('noop')} class="cursor-pointer">Create</Button>
	</div>

	<Card class="overflow-hidden" size="xl">
		<Table>
			<TableHead>
				<TableHeadCell class="w-1/4">Name</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each organizations as entry (entry.id)}
					<TableBodyRow>
						<TableBodyCell>{entry.name}</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</Card>
</Container>
