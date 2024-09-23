import { onMount } from 'svelte';

import { writable } from 'svelte/store';
import type { AwaitedReturn } from '../utils/types';

// eslint-disable-next-line
export function useAsyncData<C extends (...args: any) => any>(callback: C, ...args: Parameters<C>) {
	const data = writable<AwaitedReturn<C> | null>(null);

	onMount(async () => {
		const res = await callback(args);
		data.set(res);
	});

	return data;
}
