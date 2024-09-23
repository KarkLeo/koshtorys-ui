import { getContext } from 'svelte';
import { ApolloClient } from '@apollo/client/core';

import type {
	LoginMutation,
	LoginMutationVariables,
	LogoutMutation,
	MeQuery,
	RefreshTokensMutation,
	RefreshTokensMutationVariables,
	RegistrationMutation,
	RegistrationMutationVariables
} from '$lib/graphql/types';

import REGISTRATION from '$lib/graphql/registration.graphql';
import LOGIN from '$lib/graphql/login.graphql';
import ME from '$lib/graphql/me.graphql';
import REFRESH_TOKENS from '$lib/graphql/refresh-tokens.graphql';
import LOGOUT from '$lib/graphql/logout.graphql';

import TokensService from './tokens-service';

class AuthService {
	client: ApolloClient<unknown> | null = null;

	constructor(client?: ApolloClient<unknown>) {
		this.client = client || (getContext('apollo') as ApolloClient<unknown>);
	}

	async signUp(name: string, email: string, password: string) {
		if (!this.client) {
			throw new Error('Apollo client is not initialized');
		}

		const { data } = await this.client.mutate<RegistrationMutation, RegistrationMutationVariables>({
			mutation: REGISTRATION,
			variables: {
				name,
				email,
				password
			}
		});
		if (data) {
			return data.signUp;
		}
		return null;
	}

	async signIn(email: string, password: string) {
		if (!this.client) {
			throw new Error('Apollo client is not initialized');
		}

		const { data } = await this.client.mutate<LoginMutation, LoginMutationVariables>({
			mutation: LOGIN,
			variables: {
				email,
				password
			}
		});
		if (data) {
			TokensService.setTokens(data.signIn.accessToken, data.signIn.refreshToken);
			return data.signIn;
		} else {
			TokensService.clearTokens();
		}
		return null;
	}

	async signOut() {
		if (!this.client) {
			throw new Error('Apollo client is not initialized');
		}

		const { data } = await this.client.mutate<LogoutMutation>({
			mutation: LOGOUT
		});
		TokensService.clearTokens();

		if (data) {
			return data.signOut;
		}
	}

	async me() {
		try {
			console.log('me');
			if (!this.client) {
				throw new Error('Apollo client is not initialized');
			}
			console.log('me2');
			const { data, error, errors, loading } = await this.client.query<MeQuery>({
				query: ME
			});
			console.log('me3');
			if (error) {
				console.error(error, errors, loading);
			}

			if (data) {
				return data.me;
			}
			return null;
		} catch (e) {
			console.log('me error', e);
		}
	}

	async refreshTokens() {
		if (!this.client) {
			throw new Error('Apollo client is not initialized');
		}
		const refreshToken = TokensService.getRefreshToken();
		if (!refreshToken) {
			return null;
		}
		const { data } = await this.client.mutate<
			RefreshTokensMutation,
			RefreshTokensMutationVariables
		>({
			mutation: REFRESH_TOKENS,
			variables: {
				refreshToken
			}
		});
		if (data) {
			TokensService.setTokens(data.refreshTokens.accessToken, data.refreshTokens.refreshToken);
			return data.refreshTokens;
		}
		return null;
	}
}

export default AuthService;
