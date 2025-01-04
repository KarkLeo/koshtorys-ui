<script lang="ts">
	import { me } from '$lib/store/me';
	import AddTransactionForm from '$lib/components/AddTransactionForm.svelte';
</script>

{#if $me}
	<h1>Привет, {$me.name}</h1>
{:else}
	<h1>Привет, гость</h1>
{/if}

<AddTransactionForm />
