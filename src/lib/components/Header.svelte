<script lang="ts">
	import LangSwitcher from './LangSwitcher.svelte';
</script>

<header class="header">
	<div class="inner">
		<div class="left-side"></div>
		<div class="right-side">
			<LangSwitcher />
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
