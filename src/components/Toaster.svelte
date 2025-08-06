<script lang="ts">
	import Toast from './Toast.svelte';
	import { toast } from '$lib/client/stores/toasts';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
</script>

<ul class="fixed list-none pointer-events-none z-[9999]">
	{#each $toast as item (item.id)}
		<li in:fly={item.intro} out:fly={item.intro} animate:flip={{ duration: 200 }}>
			<Toast {item} />
		</li>
	{/each}
</ul>

<style lang="postcss">
	@reference 'tailwindcss';

	ul {
		@media (width < 40rem /* sm = 640px */) {
			top: calc(var(--spacing) * 2);
			left: 50%;
			transform: translate(-50%, 0);
		}

		@media (width >= 40rem /* sm = 640px */) {
			right: calc(var(--spacing) * 8);
			bottom: calc(var(--spacing) * 4);
		}
	}
</style>
