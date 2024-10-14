<script lang="ts">
	import { me } from '$lib/store/me';
</script>

{#if $me}
	<h1>Привет, {$me.name}</h1>
{:else}
	<h1>Привет, гость</h1>
{/if}
