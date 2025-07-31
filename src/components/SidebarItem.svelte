<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';

	let {
		label,
		href,
		icon,
	}: {
		label: string;
		href: string;
		icon?: Snippet;
	} = $props();

	const activeClass = 'bg-gray-200 text-gray-900';

	let active: string = $derived(page.url.pathname === href ? activeClass : '');
</script>

<li>
	<a
		{href}
		class="{active} flex items-center rounded-sm p-2 text-base font-normal text-gray-900 group-has-[ul]:ms-6 hover:bg-gray-100"
		target={href.startsWith('http') ? '_blank' : undefined}
	>
		{@render icon?.()}
		<span class="ms-3">{label}</span>
	</a>
</li>
