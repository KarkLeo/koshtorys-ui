<script lang="ts">
	import { goto } from '$app/navigation';
	import IconButton from '$lib/kit/IconButton.svelte';
	import Logout from '$lib/icons/Logout.svelte';
	import LangSwitcher from './LangSwitcher.svelte';
	import AuthService from '$lib/services/auth-service';
	import { me } from '$lib/store/me';

	async function handleLogout() {
		try {
			await AuthService.signOut();
			me.set(null);
		} finally {
			await goto('/', { replaceState: true });
		}
	}
</script>

<header class="header">
	<div class="inner">
		<div class="left-side"></div>
		<div class="right-side">
			{#if $me}
				<IconButton on:click={handleLogout}>
					<Logout />
				</IconButton>
			{:else}
				<LangSwitcher />
			{/if}
		</div>
	</div>
</header>

<style>
	.header {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: var(--spacing-xl);
		box-sizing: border-box;

		border-bottom: 1px solid var(--border-secondary);
	}

	.inner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-sizing: border-box;
		max-width: var(--container-max-width-desktop);
		width: 100%;
	}

	@media screen and (min-width: 768px) {
		.header {
			padding: var(--spacing-xl) var(--spacing-4xl);
		}
	}
</style>
