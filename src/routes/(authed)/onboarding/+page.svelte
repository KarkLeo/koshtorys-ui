<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { me } from '$lib/store/me';
	import { ONBOARDING_UPDATED_AT } from '$lib/constants/meta';

	onMount(async function () {
		// Redirect to Profile page
		if ($me?.onboardingAt && new Date($me?.onboardingAt) >= new Date(ONBOARDING_UPDATED_AT)) {
			await goto('/profile', { replaceState: true });
		}
	});
</script>

<h1>Onboarding</h1>
