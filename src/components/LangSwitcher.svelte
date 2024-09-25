<script lang="ts">
	import { locale, locales } from 'svelte-i18n';
	import Dropdown from './kit/Dropdown.svelte';

	const getLangLabel = (locale: string) => {
		switch (locale) {
			case 'en':
				return 'Eng';
			case 'uk-UA':
				return 'Укр';
			default:
				return locale;
		}
	};
</script>

<select bind:value={$locale}>
	{#each $locales as locale}
		<option value={locale}>{locale}</option>
	{/each}
</select>
<Dropdown bind:selected={$locale} options={$locales} getOptionLabel={getLangLabel} />
