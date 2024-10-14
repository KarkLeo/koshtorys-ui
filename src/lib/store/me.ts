import { writable } from 'svelte/store';
import type { AwaitedReturn } from '../../utils/types';
import AuthService from '$lib/services/auth-service';

export const me = writable<AwaitedReturn<typeof AuthService.me>>(null);
