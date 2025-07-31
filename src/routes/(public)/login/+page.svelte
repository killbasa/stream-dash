<script lang="ts">
	import { authClient } from '$lib/client/auth';
	import { Button } from 'flowbite-svelte';
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/3 flex flex-col">
	<div class="select-none p-2 text-3xl flex h-full items-center gap-2">
		<h1>Stream Dashboard</h1>
	</div>

	<div class="flex flex-col w-80">
		<Button
			type="button"
			onclick={async () => {
				await authClient.signIn.social({
					provider: 'google',
				});
			}}
		>
			Continue with Google
		</Button>
	</div>
</div>
