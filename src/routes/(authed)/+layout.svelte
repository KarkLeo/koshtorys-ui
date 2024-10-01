<script lang="ts">
	import AuthService from '$lib/services/auth-service';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { me } from '$lib/store/me';
	import { _, locale } from 'svelte-i18n';

	const auth = new AuthService();

	onMount(async function () {
		try {
			const user = await auth.me();
			me.set(user);
			if (user?.lang === 'en' || user?.lang === 'uk-UA') {
				locale.set(user.lang);
			}
			if (!user) {
				await goto('/', { replaceState: true });
			}
		} catch (e) {
			console.error(e);
			await goto('/', { replaceState: true });
		}
	});
</script>

<h1>{$_('hello')}</h1>

<slot />
