<script lang="ts">
	import Container from '$components/layout/Container.svelte';
	import { Alert, Button, ButtonGroup, Card, Input, InputAddon, Label } from 'flowbite-svelte';
	import InfoCircleSolid from 'flowbite-svelte-icons/InfoCircleSolid.svelte';
	import EyeOutline from 'flowbite-svelte-icons/EyeOutline.svelte';
	import EyeSlashOutline from 'flowbite-svelte-icons/EyeSlashOutline.svelte';
	import type { PageProps, SubmitFunction } from './$types';
	import { enhance } from '$app/forms';

	let { data, params }: PageProps = $props();

	let errorNotif = $state<string>();
	let showApiToken = $state<boolean>(false);
	let showWebhookSecret = $state<boolean>(false);

	const handleCreate: SubmitFunction = () => {
		return function ({ result }) {
			if (result.type === 'failure') {
				console.error('Failed to update settings:', result.data?.errors);
				errorNotif = 'Failed to update settings';
				return;
			}

			if (result.type === 'error') {
				console.error('Error updating settings:', result.error);
				errorNotif = 'Error updating settings';
				return;
			}
		};
	};
</script>

<svelte:head>
	<title>Cloudflare settings | {params.orgSlug}</title>
</svelte:head>

<Container>
	<h1 class="text-xl">Cloudflare settings</h1>

	{#if errorNotif}
		<Alert color="red" dismissable onclick={() => (errorNotif = undefined)}>
			{#snippet icon()}<InfoCircleSolid class="h-5 w-5" />{/snippet}
			{errorNotif}
		</Alert>
	{/if}

	<form method="POST" action="?/update" use:enhance={handleCreate}>
		<Card class="p-4 gap-4" size="xl">
			<div>
				<Label for="cf_accountid" class="mb-1">Account ID</Label>
				<Input
					type="text"
					id="cf_accountid"
					name="cf_accountid"
					required
					autocomplete="off"
					value={data.cfCredentials?.accountId}
				/>
			</div>

			<div>
				<Label for="cf_apitoken" class="mb-1">API Token</Label>
				<ButtonGroup class="w-full">
					<InputAddon>
						<button
							type="button"
							class="cursor-pointer"
							onclick={() => (showApiToken = !showApiToken)}
						>
							{#if showApiToken}
								<EyeOutline class="h-6 w-6" />
							{:else}
								<EyeSlashOutline class="h-6 w-6" />
							{/if}
						</button>
					</InputAddon>
					<Input
						type={showApiToken ? 'text' : 'password'}
						id="cf_apitoken"
						name="cf_apitoken"
						required
						autocomplete="off"
						value={data.cfCredentials?.apiToken}
					/>
				</ButtonGroup>
			</div>

			<div>
				<Label for="cf_webhooksecret" class="mb-1">Webhook Secret</Label>
				<ButtonGroup class="w-full">
					<InputAddon>
						<button
							type="button"
							class="cursor-pointer"
							onclick={() => (showWebhookSecret = !showWebhookSecret)}
						>
							{#if showWebhookSecret}
								<EyeOutline class="h-6 w-6" />
							{:else}
								<EyeSlashOutline class="h-6 w-6" />
							{/if}
						</button>
					</InputAddon>
					<Input
						type={showWebhookSecret ? 'text' : 'password'}
						id="cf_webhooksecret"
						name="cf_webhooksecret"
						required
						autocomplete="off"
						value={data.cfCredentials?.webhookSecret}
					/>
				</ButtonGroup>
			</div>

			<div>
				<Button type="submit" size="xs">Save</Button>
			</div>
		</Card>
	</form>
</Container>
