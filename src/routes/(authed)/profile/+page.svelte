<script lang="ts">
	import { goto } from '$app/navigation';
	import AuthService from '$lib/services/auth-service';
	import { me } from '$lib/store/me';

	const auth = new AuthService();

	async function handleLogout() {
		try {
			await auth.signOut();
		} finally {
			await goto('/', { replaceState: true });
		}
	}
</script>

{#if $me}
	<h1>Привет, {$me.name}</h1>
{:else}
	<h1>Привет, гость</h1>
{/if}

<button on:click={handleLogout}>Logout</button>
