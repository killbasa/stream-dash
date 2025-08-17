<svelte:head>
	<title>Schedule</title>
</svelte:head>

<section>
	<div class="calendar-container border rounded flex flex-col">
		<div class="border p-2">Header</div>
		<div class="flex flex-row overflow-y-scroll">
			<div class="h-full border">Times</div>
			<div class="h-full border">Content</div>
		</div>
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
