<script lang="ts">
	import CheckCircleSolid from 'flowbite-svelte-icons/CheckCircleSolid.svelte';
	import FileCopyAltSolid from 'flowbite-svelte-icons/FileCopyAltSolid.svelte';

	let {
		id,
		label,
		content = '',
		oncopy,
	}: {
		id: string;
		label: string;
		content: string | undefined;
		oncopy?: () => void;
	} = $props();

	let copied = $state<boolean>(false);
</script>

<svelte:window
	onclick={() => {
		if (document.activeElement?.id !== id) {
			copied = false;
		}
	}}
/>

<div class="flex flex-col gap-1">
	<span>{label}</span>
	<div class="flex items-center border rounded px-1 bg-gray-700">
		<button
			type="button"
			{id}
			class="cursor-pointer"
			onclick={() => {
				navigator.clipboard.writeText(content);
				oncopy?.();
				copied = true;
			}}
		>
			{#if copied}
				<CheckCircleSolid class="shrink-0 h-6 w-6" />
			{:else}
				<FileCopyAltSolid class="shrink-0 h-6 w-6" />
			{/if}
		</button>
		<span class="text-sm overflow-x-scroll whitespace-nowrap p-2">
			{content}
		</span>
	</div>
</div>
