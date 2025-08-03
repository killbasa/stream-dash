<script lang="ts">
	import { toast } from '$lib/client/stores/toasts';
	import FileCopyAltSolid from 'flowbite-svelte-icons/FileCopyAltSolid.svelte';

	let {
		label,
		content = '',
	}: {
		label: string;
		content: string | undefined;
	} = $props();
</script>

<div class="flex flex-col gap-1">
	<span>{label}</span>
	<div class="flex items-center border rounded px-1 bg-gray-700">
		<button
			type="button"
			class="cursor-pointer"
			onclick={() => {
				navigator.clipboard.writeText(content);
				toast.success('Copied to clipboard');
			}}
		>
			<FileCopyAltSolid class="shrink-0 h-6 w-6" />
		</button>
		<span class="text-sm overflow-x-scroll whitespace-nowrap p-2">
			{content}
		</span>
	</div>
</div>
