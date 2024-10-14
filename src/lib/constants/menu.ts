import Home from '$lib/icons/Home.svelte';
import Settings from '$lib/icons/Settings.svelte';

export const MENU = [
	{
		icon: Home,
		name: 'Dashboard',
		path: '/dashboard'
	},
	{
		icon: Settings,
		name: 'Settings',
		path: '/settings'
	}
];

export const ONBOARDING_PATHS = '/onboarding';
