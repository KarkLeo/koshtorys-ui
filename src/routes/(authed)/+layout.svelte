<script lang="ts">
	import AuthService from '$lib/services/auth-service';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { me } from '$lib/store/me';
	import { locale } from 'svelte-i18n';
	import { ONBOARDING_UPDATED_AT } from '$lib/constants/meta';

	onMount(async function () {
		try {
			const user = $me || (await AuthService.me());

			// ===== Redirect to Home page =====
			if (!user) {
				me.set(null);
				await goto('/', { replaceState: true });
				return;
			}

			// ===== Set user =====
			me.set(user);

			// ===== Set user language =====
			if (user.lang === 'en' || user.lang === 'uk-UA') {
				locale.set(user.lang);
			}

			// ===== Redirect to Onboarding page =====
			if (!user.onboardingAt || new Date(user.onboardingAt) < new Date(ONBOARDING_UPDATED_AT)) {
				await goto('/onboarding', { replaceState: true });
			}
		} catch (e) {
			console.error(e);
			me.set(null);
			await goto('/', { replaceState: true });
			return;
		}
	});
</script>

<slot />
