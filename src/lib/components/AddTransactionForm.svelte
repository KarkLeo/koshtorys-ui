<script lang="ts">
	import { me } from '$lib/store/me';
	import MoneyInput from '$lib/kit/MoneyInput.svelte';
	import { CURRENCIES } from '$lib/constants/currencies';
	import Input from '$lib/kit/Input.svelte';
	import Button from '$lib/kit/Button.svelte';

	let transactionValue = '';
	let currency = $me?.currency || CURRENCIES[0];
	let isFocused = false;
	let transactionTitle = '';

	$: showFullComponent = isFocused || Boolean(transactionValue) || transactionTitle.length > 0;
</script>

<div>
	{transactionValue.length}
</div>

<div class="add-transaction-form" class:active={showFullComponent}>
	<MoneyInput
		bind:value={transactionValue}
		on:focus={() => (isFocused = true)}
		on:blur={() => (isFocused = false)}
		bind:currency
	/>
	<Input
		bind:value={transactionTitle}
		on:focus={() => (isFocused = true)}
		on:blur={() => (isFocused = false)}
		type="text"
	/>
	<Button>Save</Button>
</div>

<style>
	.add-transaction-form {
		position: fixed;

		bottom: 0;

		width: 100%;
		padding: 1rem;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 16px;

		border: 1px solid red;
		background-color: violet;
		border-radius: 8px;

		transform: translateY(calc(100% - 70px));
		transition: all 0.5s ease-in-out;
	}
	.active {
		transform: translateY(0);
	}
</style>
