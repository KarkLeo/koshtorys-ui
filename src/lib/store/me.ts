import { writable } from 'svelte/store';
import type { AwaitedReturn } from '../../utils/types';
import AuthService from '$lib/services/auth-service';
import client from '$lib/apolloClient';

// eslint-disable-next-line
const auth = new AuthService(client);

export const me = writable<AwaitedReturn<typeof auth.me>>(null);
