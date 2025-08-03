<script lang="ts">
	import { authClient } from '$lib/client/auth';
	import { Button } from 'flowbite-svelte';
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';

	let {
		list,
	}: {
		list: Snippet;
	} = $props();

	const session = authClient.useSession();
</script>

<aside
	class="sticky top-0 flex h-screen w-48 flex-col justify-between bg-gray-800 border-r border-gray-700"
>
	<div class="overflow-y-auto px-3 py-4">
		{@render list()}
	</div>
	<div class="overflow-y-auto px-3 py-4">
		<ul class="space-y-2">
			<div class="flex items-center gap-2 justify-between">
				<div class="flex items-center gap-2">
					{$session?.data?.user.name}
				</div>
				<Button
					type="button"
					class="cursor-pointer"
					size="xs"
					onclick={async () => {
						await authClient.signOut({
							fetchOptions: {
								onSuccess: () => goto('/login'),
							},
						});
					}}
				>
					Sign Out
				</Button>
			</div>
		</ul>
	</div>
</aside>
