<script lang="ts">
	import { setContext } from 'svelte';
	import { locale, waitLocale, isLoading } from 'svelte-i18n';
	import { browser } from '$app/environment';
	import '$lib/i18n';
	import client from '$lib/apolloClient';
	import Header from '$lib/components/Header.svelte';
	import { Toaster } from 'svelte-french-toast';
	import Loading from '$lib/icons/Loading.svelte';

	setContext('apollo', client);

	export async function load() {
		if (browser) {
			const navigatorLocale = window.navigator.language;
			if (navigatorLocale === 'en' || navigatorLocale === 'uk-UA') {
				locale.set(navigatorLocale);
			} else {
				locale.set('en');
			}
		}
		await waitLocale();

		return {
			done: true
		};
	}
</script>

<div class="page">
	{#if $isLoading}
		<div class="loader-wrapper">
			<Loading class="loader" />
		</div>
	{:else}
		<Header />
		<slot />
	{/if}
</div>

<Toaster
	position="top-right"
	toastOptions={{
		className: 'notification',
		duration: 5000
	}}
/>

<style>
	:global(.notification) {
		max-width: 100%;
		width: 260px;
		padding: var(--spacing-xl);
		box-sizing: border-box;
		justify-content: flex-start !important;
		align-items: flex-start !important;
		gap: var(--spacing-lg);

		font-size: var(--font-size-text-sm);
		line-height: var(--line-height-text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--fg-primary) !important;
		text-align: left;

		background-color: var(--bg-primary_alt) !important;
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-xl);
		box-shadow:
			0 4px 6px -2px rgba(16, 24, 40, 0.03),
			0 12px 16px -4px rgba(16, 24, 40, 0.08);
	}
	:global(.notification .message) {
		margin: 0 !important;
		width: 100%;
		justify-content: flex-start !important;
	}

	.page {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: stretch;
		min-height: 100vh;
	}

	.loader-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		flex-grow: 1;
	}
	:global(.loader) {
		margin: var(--spacing-4xl) auto;

		width: var(--spacing-5xl);
		height: var(--spacing-5xl);

		color: var(--fg-secondary);

		animation: spin 2s linear infinite;
	}
	@keyframes spin {
		0% {
			transform: rotate(0deg) scale(1);
			opacity: 0.25;
		}
		50% {
			transform: rotate(180deg) scale(1.1);
			opacity: 0.5;
		}
		100% {
			transform: rotate(360deg) scale(1);
			opacity: 0.25;
		}
	}
</style>
