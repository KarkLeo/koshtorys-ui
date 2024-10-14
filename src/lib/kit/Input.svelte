<script lang="ts">
	import { createEventDispatcher } from 'svelte';

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

	export let type: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' = 'text';
	export let disabled: boolean = false;
	export let size: 'sm' | 'md' = 'md';
	export let className: string = '';
	export let placeholder: string = '';
	export let error: boolean = false;
	export let value: string | number = '';
</script>

<span class={`field ${error ? 'error' : ''}`}>
	{#if type === 'text'}
		<input
			bind:value
			type="text"
			{disabled}
			class={`input ${size} ${error ? 'error' : ''} ${className}`}
			{placeholder}
			on:input={handleInput}
			on:change={handleChange}
			on:blur={handleBlur}
			on:focus={handleFocus}
			{...$$restProps}
		/>
	{:else if type === 'password'}
		<input
			bind:value
			type="password"
			{disabled}
			class={`input ${size} ${error ? 'error' : ''} ${className}`}
			{placeholder}
			on:input={handleInput}
			on:change={handleChange}
			on:blur={handleBlur}
			on:focus={handleFocus}
			{...$$restProps}
		/>
	{:else if type === 'email'}
		<input
			bind:value
			type="email"
			{disabled}
			class={`input ${size} ${error ? 'error' : ''} ${className}`}
			{placeholder}
			on:input={handleInput}
			on:change={handleChange}
			on:blur={handleBlur}
			on:focus={handleFocus}
			{...$$restProps}
		/>
	{:else if type === 'number'}
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
	{:else if type === 'tel'}
		<input
			bind:value
			type="tel"
			{disabled}
			class={`input ${size}  ${error ? 'error' : ''} ${className}`}
			{placeholder}
			on:input={handleInput}
			on:change={handleChange}
			on:blur={handleBlur}
			on:focus={handleFocus}
			{...$$restProps}
		/>
	{:else if type === 'url'}
		<input
			bind:value
			type="url"
			{disabled}
			class={`input ${size} ${error ? 'error' : ''} ${className}`}
			{placeholder}
			on:input={handleInput}
			on:change={handleChange}
			on:blur={handleBlur}
			on:focus={handleFocus}
			{...$$restProps}
		/>
	{/if}

	<span class="outline"></span>
</span>

<style>
	.field {
		position: relative;
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
</style>
