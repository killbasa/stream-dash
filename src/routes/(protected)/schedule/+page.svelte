<script lang="ts">
	import { Calendar, List, TimeGrid } from '@event-calendar/core';
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';

	let { data }: PageProps = $props();

	let options = $state<Calendar.Options>({
		scrollTime: '09:00:00',
		nowIndicator: true,
		selectable: true,
		view: 'timeGridWeek',
		views: {
			timeGridWeek: { pointer: true },
		},
		headerToolbar: {
			start: 'prev,next today',
			center: 'title',
			end: 'timeGridWeek,timeGridDay,listWeek',
		},
		events: data.blocks.map((block) => ({
			id: block.id,
			title: block.name,
			start: new Date(block.start),
			end: new Date(block.end),
			className: 'cursor-pointer',
		})),

		eventClick: async (event) => {
			await goto(`/blocks/${event.event.id}`);
		},
	});
</script>

<svelte:head>
	<title>Schedule</title>
</svelte:head>

<div class="ec-dark">
	<Calendar plugins={[List, TimeGrid]} {options} />
</div>

<style>
	.ec-dark {
		display: flex;
		height: calc(100vh - 2rem);
	}

	:global(.ec-event-description) {
		font-size: 0.8em;
		white-space: pre-line;
		margin-top: 0.25rem;
	}
</style>
