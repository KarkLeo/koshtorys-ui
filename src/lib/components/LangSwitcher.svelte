<script lang="ts">
	import { locale, locales } from 'svelte-i18n';
	import Dropdown from '$lib/kit/Dropdown.svelte';

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

<Dropdown bind:selected={$locale} options={$locales} getOptionLabel={getLangLabel} />
