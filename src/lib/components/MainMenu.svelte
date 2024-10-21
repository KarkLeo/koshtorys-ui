<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { MENU, ONBOARDING_PATHS } from '$lib/constants/menu';
	import { page } from '$app/stores';
</script>

{#if $page.url.pathname !== ONBOARDING_PATHS}
	<nav class="main-menu">
		<ul class="main-menu-list">
			{#each MENU as item (item.path)}
				<li class="main-menu-item">
					<a
						href={item.path}
						class="main-menu-link"
						class:active={item.path === $page.url.pathname}
					>
						<svelte:component this={item.icon} />
						<span>
							{$_(`mainMenu.${item.name}`)}
						</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}

<style>
	.main-menu {
		padding: var(--spacing-md);
	}

	.main-menu-list {
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		gap: var(--spacing-xl);
		padding: 0;
		margin: 0;
	}

	.main-menu-item {
		padding: 0;
		margin: 0;
		list-style: none;
	}

	.main-menu-link {
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		gap: var(--spacing-xs);
		padding: var(--spacing-md) var(--spacing-lg);

		color: var(--text-secondary);
		text-decoration: none;

		border-radius: var(--radius-sm);
	}

	.main-menu-link.active,
	.main-menu-link:hover {
		background-color: var(--bg-active);
	}

	.main-menu-link :global(svg) {
		width: 24px;
		height: 24px;

		color: var(--text-tertiary);

		transition: color 0.2s ease;
	}
	.main-menu-link:hover :global(svg),
	.main-menu-link:focus :global(svg) {
		color: var(--text-secondary);
	}
</style>
