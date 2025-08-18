<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';

	let {
		label,
		href,
		icon,
		external,
	}: {
		label: string;
		href: string;
		icon?: Snippet;
		external?: boolean;
	} = $props();

	let active: string = $derived(page.url.pathname === href ? 'bg-gray-200 text-gray-900' : '');
</script>

<a
	{href}
	class="{active} flex items-center rounded-sm p-2 text-base font-normal text-gray-300 group-has-[ul]:ms-6 hover:bg-gray-100 hover:text-gray-900"
	target={external || href.startsWith('http') ? '_blank' : undefined}
>
	{@render icon?.()}
	<span class="ms-3">{label}</span>
</a>
