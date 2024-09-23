import { getContext, onMount } from 'svelte';
import { writable } from 'svelte/store';
import { ApolloClient, type OperationVariables } from '@apollo/client/core';
import type { AwaitedReturn } from '../utils/types';

export function useQuery<
	Q extends object,
	// eslint-disable-next-line
	V extends OperationVariables = {}
	// eslint-disable-next-line
>(query: any, variables?: V) {
	const client = getContext('apollo') as ApolloClient<unknown>;

	const fetch = async () => {
		const { data } = await client.query<Q, V>({
			query,
			variables
		});
		if (data) {
			return data;
		}
		return null;
	};

	const data = writable<AwaitedReturn<typeof fetch> | null>(null);
	onMount(async () => {
		const res = await fetch();
		data.set(res);
	});
	return data;
}

export function useMutation<
	M extends object,
	// eslint-disable-next-line
	V extends OperationVariables = {}
	// eslint-disable-next-line
>(mutation: any, variables?: V) {
	const client = getContext('apollo') as ApolloClient<unknown>;

	const fetch = async () => {
		const { data } = await client.mutate<M, V>({
			mutation,
			variables
		});

		if (data) {
			return data;
		}
		return null;
	};

	const data = writable<AwaitedReturn<typeof fetch> | null>(null);
	onMount(async () => {
		const res = await fetch();
		data.set(res);
	});
	return data;
}
