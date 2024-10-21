<script lang="ts">
	import Tabs from '$lib/kit/Tabs.svelte';
	import { TABS } from '$lib/constants/settings';
	import { me } from '$lib/store/me';
</script>

{#if $me}
	<Tabs tabs={TABS} langPrefix="settings.tabs." />
{/if}
