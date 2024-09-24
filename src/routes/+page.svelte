<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import AuthService from '../services/auth-service';
	import type { AwaitedReturn } from '../utils/types';
	import { useQuery } from '../hook/useApollo';

	import ME from '$lib/graphql/me.graphql';
	import type { MeQuery } from '$lib/graphql/types';
	import { useAsyncData } from '../hook/useAsyncData';

	import Button from '../components/kit/Button.svelte';
	import Input from '../components/kit/Input.svelte';

	const auth = new AuthService();

	let user: AwaitedReturn<typeof auth.me> = null;
	onMount(async () => {
		user = await auth.me();
		if (user) {
			await goto('/profile');
		}
	});

	// todo remove this
	const t = useQuery<MeQuery>(ME);
	const a = useAsyncData<typeof auth.me>(auth.me.bind(auth));

	let input = '';
</script>

<p>{$a?.name}</p>
<p>{$t?.me.name}</p>
{#if user}
	<h1>Привет, {user.name}</h1>
{:else}
	<h1>Привет, гость</h1>
{/if}

<div class="row">
	<Button size="sm">Small Button</Button>
	<Button on:click={() => console.log('test ok')}>Primary</Button>
	<Button size="lg">LG Large Button</Button>
	<Button size="xl">XL Large Button</Button>
	<Button size="xxl">XXL Large Button</Button>
	<Button disabled>Disabled Button</Button>
</div>
<div class="row">
	<Button variant="secondary-gray" size="sm">Small Button</Button>
	<Button variant="secondary-gray">Primary</Button>
	<Button variant="secondary-gray" size="lg">LG Large Button</Button>
	<Button variant="secondary-gray" size="xl">XL Large Button</Button>
	<Button variant="secondary-gray" size="xxl">XXL Large Button</Button>
	<Button variant="secondary-gray" disabled>Disabled Button</Button>
</div>
<div class="row">
	<Button>Primary</Button>
	<Button variant="secondary-gray">Primary</Button>
</div>
<div class="row">{input}</div>
<div class="row">
	<Input bind:value={input} label="Email" type="email" placeholder="Enter your email" />
	<Input
		bind:value={input}
		label="Email"
		type="email"
		placeholder="Enter your email"
		message="Your new password must be more than 8 characters."
	/>
	<Input bind:value={input} label="Email" type="email" placeholder="Enter your email" disabled />
	<Input bind:value={input} size="sm" label="Email" type="email" placeholder="Enter your email" />
</div>
<div class="row">
	<Input bind:value={input} type="password" error label="Email" placeholder="Enter your email" />
	<Input
		bind:value={input}
		error
		label="Email"
		type="email"
		placeholder="Enter your email"
		message="Your new password must be more than 8 characters."
	/>
	<Input
		bind:value={input}
		error
		label="Email"
		type="email"
		placeholder="Enter your email"
		disabled
	/>
	<Input
		bind:value={input}
		error
		size="sm"
		label="Email"
		type="email"
		placeholder="Enter your email"
	/>
</div>

<p>Please <a href="/login">login</a> or <a href="/register">register</a>.</p>

<style>
	.row {
		margin: var(--spacing-lg) 0;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: var(--spacing-md);
	}
</style>
