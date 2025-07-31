<script lang="ts">
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
	} from 'flowbite-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Live-Inputs</title>
</svelte:head>

<section class="mx-auto flex w-full max-w-6xl flex-col items-center gap-8">
	<h1>Live-Inputs</h1>

	<Table>
		<TableHead>
			<TableHeadCell>UID name</TableHeadCell>
			<TableHeadCell>Name</TableHeadCell>
			<TableHeadCell>Talent</TableHeadCell>
			<TableHeadCell>Schedule for</TableHeadCell>
			<TableHeadCell>Actions</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each data.liveInputs ?? [] as entry (entry.uid)}
				<TableBodyRow>
					<TableBodyCell>{entry.uid}</TableBodyCell>
					<TableBodyCell>{(entry.meta as { name: string }).name}</TableBodyCell>
					<TableBodyCell></TableBodyCell>
					<TableBodyCell></TableBodyCell>
					<TableBodyCell>
						<a href="/live-inputs/{entry.uid}">View</a>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
</section>
