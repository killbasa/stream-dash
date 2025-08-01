<script lang="ts">
	import { authClient } from '$lib/client/auth';
	import { Button } from 'flowbite-svelte';
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';

	let {
		items,
	}: {
		items: Snippet;
	} = $props();

	const session = authClient.useSession();
</script>

<aside class="sticky top-0 flex h-screen w-64 flex-col justify-between bg-gray-800">
	<div class="overflow-y-auto px-3 py-4">
		<ul class="space-y-2">
			{@render items()}
		</ul>
	</div>
	<div class="overflow-y-auto px-3 py-4">
		<ul class="space-y-2">
			<div class="flex items-center gap-2 justify-between">
				<div class="flex items-center gap-2">
					<img
						src={$session.data?.user.image}
						alt="User Avatar"
						class="h-8 w-8 rounded-full"
					/>
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
