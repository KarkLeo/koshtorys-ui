<script lang="ts">
	import AuthService from '$lib/services/auth-service';
	import { onMount, setContext } from 'svelte';
	import { goto } from '$app/navigation';

	const auth = new AuthService();

	onMount(async () => {
		try {
			const user = await auth.me();
			setContext('me', user);
			if (!user) {
				await goto('/', { replaceState: true });
			}
		} catch (e) {
			console.error(e);
			await goto('/', { replaceState: true });
		}
	});
</script>

<slot />
