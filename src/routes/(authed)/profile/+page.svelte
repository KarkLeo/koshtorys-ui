<script lang="ts">
	import AuthService from '$lib/services/auth-service';
	import type { AwaitedReturn } from '../../../utils/types';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';

	const auth = new AuthService();

	const user = getContext<AwaitedReturn<typeof auth.me>>('me');

	async function handleLogout() {
		try {
			await auth.signOut();
		} finally {
			await goto('/', { replaceState: true });
		}
	}
</script>

{#if user}
	<h1>Привет, {user.name}</h1>
{:else}
	<h1>Привет, гость</h1>
{/if}

<button on:click={handleLogout}>Logout</button>
