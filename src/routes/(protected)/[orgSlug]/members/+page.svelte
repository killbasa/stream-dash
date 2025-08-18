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

	let { data, params }: PageProps = $props();

	let members = $derived(data.members.members);
</script>

<svelte:head>
	<title>Members | {params.orgSlug}</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Members</h1>

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
