<script lang="ts">
	import '@schedule-x/theme-default/dist/index.css';
	import { ScheduleXCalendar } from '@schedule-x/svelte';
	import {
		CalendarApp,
		createCalendar,
		createViewDay,
		createViewWeek,
	} from '@schedule-x/calendar';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data, params }: PageProps = $props();

	let calendarApp = $state<CalendarApp>();

	onMount(() => {
		calendarApp = createCalendar({
			views: [createViewDay(), createViewWeek()],
			events: data.blocks.map((block) => {
				return {
					id: block.id,
					title: block.name,
					start: fmtDate(block.start),
					end: fmtDate(block.end),
				};
			}),
		});
	});

	const fmtDate = (date: Date) => {
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		const hour = date.getHours().toString().padStart(2, '0');
		const minute = date.getMinutes().toString().padStart(2, '0');

		// TODO - Doesn't handle timezones

		return `${year}-${month}-${day} ${hour}:${minute}`;
	};
</script>

<svelte:head>
	<title>Schedule | {params.orgSlug}</title>
</svelte:head>

<section>
	<div class="calendar-container">
		{#if calendarApp}
			<ScheduleXCalendar {calendarApp} />
		{/if}
	</div>
</section>

<style lang="postcss">
	@reference 'tailwindcss';

	.calendar-container {
		height: calc(100vh - 2rem);
	}

	@media (width < 640px) {
		.calendar-container {
			height: calc(100vh - 4.3rem);
		}
	}
</style>
