<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import { toast } from '$lib/client/stores/toasts';
	import { Button, Card, Input, Label } from 'flowbite-svelte';
	import type { PageProps, SubmitFunction } from './$types';
	import { enhance } from '$app/forms';

	let { data }: PageProps = $props();

	let webhook = $derived(data.webhook);

	const handleUpdate: SubmitFunction = () => {
		return function ({ result }) {
			if (result.type === 'failure') {
				// console.error('Failed to update webhook:', result.data?.errors);
				toast.error('Failed to update webhook');
				return;
			}

			if (result.type === 'error') {
				// console.error('Error updating webhook:', result.error);
				toast.error('Error updating webhook');
				return;
			}

			toast.success('Webhook updated');
		};
	};
</script>

<svelte:head>
	<title>Notifications</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Notifications</h1>

	<Button
		onclick={() => {
			toast.success('Test notification sent');
		}}>Test</Button
	>

	<form method="POST" action="?/update" use:enhance={handleUpdate}>
		<Card class="p-4 gap-4" size="xl">
			<div>
				<Label for="webhook_url" class="mb-2">Webhook URL</Label>
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
