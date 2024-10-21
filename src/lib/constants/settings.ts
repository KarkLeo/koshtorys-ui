import GeneralTab from '$lib/components/settings/GeneralTab.svelte';
import StatisticsTab from '$lib/components/settings/StatisticsTab.svelte';

export const TABS = [
	{
		key: 'general',
		component: GeneralTab
	},
	{
		key: 'statistics',
		component: StatisticsTab
	}
];
