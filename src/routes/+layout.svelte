<script lang="ts">
	import { setContext } from 'svelte';
	import { _, locale, waitLocale, isLoading } from 'svelte-i18n';
	import { browser } from '$app/environment';
	import '$lib/i18n';
	import client from '$lib/apolloClient';
	import LangSwitcher from '../components/LangSwitcher.svelte';

	setContext('apollo', client);

	export const load = async () => {
		if (browser) {
			locale.set(window.navigator.language);
		}
		await waitLocale();
	};
</script>

<LangSwitcher />

{#if $isLoading}
	<p>Wait... Lang loading</p>
{:else}
	<p>{$_('hello')}</p>
{/if}

<slot />
