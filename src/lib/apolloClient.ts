import { ApolloClient, Observable } from '@apollo/client/core';
import { InMemoryCache } from '@apollo/client/cache';
import { createHttpLink } from '@apollo/client/link/http';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { ApolloLink } from '@apollo/client/link/core';
import fetch from 'cross-fetch';

import TokensService from '$lib/services/tokens-service';
import AuthService from '$lib/services/auth-service';

let isRefreshing = false;
// eslint-disable-next-line
let pendingRequests: any[] = [];

const resolvePendingRequests = () => {
	pendingRequests.forEach((callback) => callback());
	pendingRequests = [];
};

function rejectPendingRequests(error: Error) {
	pendingRequests.forEach((callback) => callback(error));
	pendingRequests = [];
}

export const errorLink = onError(({ graphQLErrors, operation, forward }) => {
	if (graphQLErrors) {
		for (const err of graphQLErrors) {
			if (err.extensions?.code === 'UNAUTHENTICATED') {
				if (!isRefreshing) {
					isRefreshing = true;
					const auth = new AuthService(client);
					auth
						.refreshTokens()
						.then((newTokens) => {
							if (newTokens) {
								resolvePendingRequests();
							} else {
								TokensService.clearTokens();
								rejectPendingRequests(new Error('Failed to refresh tokens'));
							}
						})
						.catch((error) => {
							TokensService.clearTokens();
							rejectPendingRequests(error);
						})
						.finally(() => {
							isRefreshing = false;
						});
				}

				return new Observable((observer) => {
					pendingRequests.push(() => {
						const accessToken = TokensService.getAccessToken();
						operation.setContext(({ headers = {} }) => ({
							headers: {
								...headers,
								authorization: accessToken ? `Bearer ${accessToken}` : ''
							}
						}));
						forward(operation).subscribe({
							next: observer.next.bind(observer),
							error: observer.error.bind(observer),
							complete: observer.complete.bind(observer)
						});
					});
				});
			}
		}
	}
});

const httpLink = createHttpLink({
	uri: 'http://localhost:3000/graphql',
	fetch
});

export const authLink = setContext((_, { headers }) => {
	const token = TokensService.getAccessToken();
	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : ''
		}
	};
});

const client = new ApolloClient({
	link: ApolloLink.from([errorLink, authLink, httpLink]),
	cache: new InMemoryCache()
});

export default client;
