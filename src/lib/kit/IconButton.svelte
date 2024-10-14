<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('click');
	}

	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let disabled: boolean = false;
	export let className: string = '';
</script>

<button {type} {disabled} class={`icon-btn ${className}`} on:click={handleClick}>
	<slot>Button</slot>
</button>

<style>
	.icon-btn {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 48px;
		height: 48px;
		padding: var(--spacing-md);
		box-sizing: border-box;

		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		outline: none;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.icon-btn:hover,
	.icon-btn:focus {
		background-color: var(--bg-active);
	}
	.icon-btn:disabled {
		cursor: not-allowed;
	}

	.icon-btn :global(svg) {
		width: 24px;
		height: 24px;

		color: var(--text-tertiary);

		transition: color 0.2s ease;
	}
	.icon-btn:hover :global(svg),
	.icon-btn:focus :global(svg) {
		color: var(--text-secondary);
	}
</style>
