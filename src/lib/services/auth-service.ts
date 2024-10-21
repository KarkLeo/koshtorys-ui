import type {
	LoginMutation,
	LoginMutationVariables,
	LogoutMutation,
	MeQuery,
	OnboardingInput,
	OnboardingMutation,
	OnboardingMutationVariables,
	RefreshTokensMutation,
	RefreshTokensMutationVariables,
	RegistrationMutation,
	RegistrationMutationVariables,
	SettingsGeneralMutation,
	SettingsGeneralMutationVariables,
	SettingsStatisticsMutation,
	SettingsStatisticsMutationVariables,
	UpdateProfileInput
} from '$lib/graphql/types';
import client from '$lib/apolloClient';

import REGISTRATION from '$lib/graphql/registration.graphql';
import LOGIN from '$lib/graphql/login.graphql';
import ME from '$lib/graphql/me.graphql';
import REFRESH_TOKENS from '$lib/graphql/refresh-tokens.graphql';
import LOGOUT from '$lib/graphql/logout.graphql';
import ONBOARDING from '$lib/graphql/onboarding.graphql';
import SETTINGS_GENERAL from '$lib/graphql/settings-general.graphql';
import SETTINGS_STATISTICS from '$lib/graphql/settings-statistics.graphql';

import TokensService from './tokens-service';

const AuthService = {
	client: client,

	async signUp(name: string, email: string, password: string, lang: string) {
		const { data } = await this.client.mutate<RegistrationMutation, RegistrationMutationVariables>({
			mutation: REGISTRATION,
			variables: {
				name,
				email,
				password,
				lang
			},
			fetchPolicy: 'no-cache'
		});
		if (data) {
			return data.signUp;
		}
		return null;
	},

	async signIn(email: string, password: string) {
		const { data } = await this.client.mutate<LoginMutation, LoginMutationVariables>({
			mutation: LOGIN,
			variables: {
				email,
				password
			},
			fetchPolicy: 'no-cache'
		});
		if (data) {
			TokensService.setTokens(data.signIn.accessToken, data.signIn.refreshToken);
			return data.signIn;
		} else {
			TokensService.clearTokens();
		}
		return null;
	},

	async signOut() {
		const { data } = await this.client.mutate<LogoutMutation>({
			mutation: LOGOUT,
			fetchPolicy: 'no-cache'
		});
		TokensService.clearTokens();
		this.client.cache.evict({ fieldName: 'me' });

		if (data) {
			return data.signOut;
		}
	},

	async me() {
		try {
			if (!this.client) {
				throw new Error('Apollo client is not initialized');
			}
			const { data, error, errors, loading } = await this.client.query<MeQuery>({
				query: ME
			});
			if (error) {
				console.error(error, errors, loading);
			}

			if (data) {
				return data.me;
			}
			return null;
		} catch (e) {
			console.log(e);
		}
	},

	async refreshTokens() {
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
			},
			fetchPolicy: 'no-cache'
		});
		if (data) {
			TokensService.setTokens(data.refreshTokens.accessToken, data.refreshTokens.refreshToken);
			return data.refreshTokens;
		}
		return null;
	},

	async onboarding(onboardingData: OnboardingInput) {
		const { data } = await this.client.mutate<OnboardingMutation, OnboardingMutationVariables>({
			mutation: ONBOARDING,
			variables: {
				...onboardingData
			},
			fetchPolicy: 'no-cache'
		});
		if (data) {
			return data.onboarding;
		}
		return null;
	},

	async settingsGeneral(updateProfileData: UpdateProfileInput) {
		const { data } = await this.client.mutate<
			SettingsGeneralMutation,
			SettingsGeneralMutationVariables
		>({
			mutation: SETTINGS_GENERAL,
			variables: {
				...updateProfileData
			},
			fetchPolicy: 'no-cache'
		});
		if (data) {
			return data.updateProfile;
		}
		return null;
	},

	async settingsStatistics(updateProfileData: UpdateProfileInput) {
		const { data } = await this.client.mutate<
			SettingsStatisticsMutation,
			SettingsStatisticsMutationVariables
		>({
			mutation: SETTINGS_STATISTICS,
			variables: {
				...updateProfileData
			},
			fetchPolicy: 'no-cache'
		});
		if (data) {
			return data.updateProfile;
		}
		return null;
	}
};

export default AuthService;
