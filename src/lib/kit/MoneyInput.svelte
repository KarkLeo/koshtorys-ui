<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { CURRENCIES } from '$lib/constants/currencies';
	import Dropdown from '$lib/kit/Dropdown.svelte';

	const dispatch = createEventDispatcher();

	function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		dispatch('input', event);
	}
	function handleChange(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		dispatch('change', event);
	}
	function handleFocus(event: FocusEvent) {
		dispatch('focus', event);
	}
	function handleBlur(event: FocusEvent) {
		dispatch('blur', event);
	}

	export let disabled: boolean = false;
	export let size: 'sm' | 'md' = 'md';
	export let className: string = '';
	export let placeholder: string = '';
	export let error: boolean = false;
	export let value: string | number = '';
	export let currency: string = CURRENCIES[0];
</script>

<span class={`money-field ${error ? 'error' : ''}`}>
	<input
		bind:value
		type="number"
		{disabled}
		class={`input ${size}  ${error ? 'error' : ''} ${className}`}
		{placeholder}
		on:input={handleInput}
		on:change={handleChange}
		on:blur={handleBlur}
		on:focus={handleFocus}
		{...$$restProps}
	/>
	<Dropdown options={CURRENCIES} bind:selected={currency} />
	<span class="outline"></span>
</span>

<style>
	.money-field {
		position: relative;

		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.input {
		width: 100%;
		display: block;
		box-sizing: border-box;

		font-size: var(--font-size-text-md);
		line-height: var(--line-height-text-md);
		font-weight: var(--font-weight-regular);
		color: var(--text-primary);

		background-color: var(--bg-primary);
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-xs);
	}

	/* Type number - hire arrows */
	.input[type='number']::-webkit-outer-spin-button,
	.input[type='number']::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	.input[type='number'] {
		-moz-appearance: textfield;
	}

	.input::placeholder {
		color: var(--text-placeholder);
	}

	.input:focus {
		outline: none;
	}

	.input:disabled {
		color: var(--text-disabled);

		background-color: var(--bg-disabled_subtle);
	}

	.outline {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 1;

		display: block;
		width: 100%;
		height: 100%;
		box-sizing: border-box;

		border: 1px solid var(--border-primary);
		border-radius: var(--radius-md);

		pointer-events: none;
	}

	.input:focus + .outline {
		border: 2px solid var(--border-brand);
	}

	.input:disabled + .outline {
		border: 1px solid var(--border-disabled);
	}

	.error .outline {
		border: 1px solid var(--border-error_subtle);
	}

	.error .input:focus + .outline {
		border: 2px solid var(--border-error);
	}

	.input.sm {
		padding: var(--spacing-md) var(--spacing-lg);
	}

	.input.md {
		padding: 10px 14px;
	}

	.money-field :global(.dropdown .outline) {
		display: none;
	}
</style>
