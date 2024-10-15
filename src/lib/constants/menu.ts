import Home from '$lib/icons/Home.svelte';
import Settings from '$lib/icons/Settings.svelte';

export const MENU = [
	{
		icon: Home,
		name: 'dashboard',
		path: '/dashboard'
	},
	{
		icon: Settings,
		name: 'settings',
		path: '/settings'
	}
];

export const ONBOARDING_PATHS = '/onboarding';
