<script lang="ts">
	import AuthService from '$lib/services/auth-service';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { me } from '$lib/store/me';
	import { _, locale } from 'svelte-i18n';
	import { ONBOARDING_UPDATED_AT } from '$lib/constants/meta';

	const auth = new AuthService();

	onMount(async function () {
		try {
			const user = await auth.me();
			me.set(user);

			// Redirect to Home page
			if (!user) {
				await goto('/', { replaceState: true });
			}

			// Set user language
			if (user?.lang === 'en' || user?.lang === 'uk-UA') {
				locale.set(user.lang);
			}

			// Redirect to Onboarding page
			if (!user?.onboardingAt || new Date(user?.onboardingAt) < new Date(ONBOARDING_UPDATED_AT)) {
				await goto('/onboarding', { replaceState: true });
			}
		} catch (e) {
			console.error(e);
			await goto('/', { replaceState: true });
		}
	});
</script>

<h1>{$_('hello')}</h1>

<slot />
