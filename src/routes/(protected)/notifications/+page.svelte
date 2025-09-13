<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import { Alert, Button, Card, Input, Label } from 'flowbite-svelte';
	import InfoCircleSolid from 'flowbite-svelte-icons/InfoCircleSolid.svelte';
	import type { PageProps, SubmitFunction } from './$types';
	import { enhance } from '$app/forms';

	let { data }: PageProps = $props();

	let webhook = $derived(data.webhook);
	let errorNotif = $state<string>();

	const handleUpdate: SubmitFunction = () => {
		return function ({ result }) {
			if (result.type === 'failure') {
				// console.error('Failed to update webhook:', result.data?.errors);
				errorNotif = 'Failed to update webhook';
				return;
			}

			if (result.type === 'error') {
				// console.error('Error updating webhook:', result.error);
				errorNotif = 'Error updating webhook';
				return;
			}
		};
	};
</script>

<svelte:head>
	<title>Notifications</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Notifications</h1>

	{#if errorNotif}
		<Alert color="red" dismissable onclick={() => (errorNotif = undefined)}>
			{#snippet icon()}<InfoCircleSolid class="h-5 w-5" />{/snippet}
			{errorNotif}
		</Alert>
	{/if}

	<form method="POST" action="?/update" use:enhance={handleUpdate}>
		<Card class="p-4 gap-4" size="xl">
			<div>
				<Label for="webhook_url" class="mb-1">Webhook URL</Label>
				<Input
					type="url"
					id="webhook_url"
					name="webhook_url"
					value={webhook?.notificationUrl}
					disabled
					autocomplete="off"
				/>
			</div>

			<div>
				<Button size="xs" type="submit" value="success" class="cursor-pointer">Save</Button>
			</div>
		</Card>
	</form>
</Container>
