export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
  user: UserWithoutPasswordModel;
};

export type ExchangeRate = {
  __typename?: 'ExchangeRate';
  base: Scalars['String']['output'];
  date: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  rates: Scalars['JSON']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createUser: UserWithoutPasswordModel;
  onboarding: UserWithoutPasswordModel;
  refreshTokens: AuthResponse;
  signIn: AuthResponse;
  signOut: Scalars['Boolean']['output'];
  signUp: UserWithoutPasswordModel;
  updateProfile: UserWithoutPasswordModel;
};


export type MutationCreateUserArgs = {
  email: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
};


export type MutationOnboardingArgs = {
  onboardingData: OnboardingInput;
};


export type MutationRefreshTokensArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationSignInArgs = {
  signInData: SignInInput;
};


export type MutationSignUpArgs = {
  signUpData: SignUpInput;
};


export type MutationUpdateProfileArgs = {
  updateProfileData: UpdateProfileInput;
};

export type OnboardingInput = {
  currency: Scalars['String']['input'];
  monthStartDay: Scalars['Float']['input'];
  monthlyBudget: Scalars['Float']['input'];
};

export type Query = {
  __typename?: 'Query';
  exchangeRate: ExchangeRate;
  exchangeRates: Array<ExchangeRate>;
  me: UserWithoutPasswordModel;
};


export type QueryExchangeRateArgs = {
  date: Scalars['DateTime']['input'];
};

export type SignInInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type SignUpInput = {
  email: Scalars['String']['input'];
  lang: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type UpdateProfileInput = {
  currency?: InputMaybe<Scalars['String']['input']>;
  lang?: InputMaybe<Scalars['String']['input']>;
  monthStartDay?: InputMaybe<Scalars['Float']['input']>;
  monthlyBudget?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  newPassword?: InputMaybe<Scalars['String']['input']>;
  oldPassword?: InputMaybe<Scalars['String']['input']>;
};

export type UserWithoutPasswordModel = {
  __typename?: 'UserWithoutPasswordModel';
  currency: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lang?: Maybe<Scalars['String']['output']>;
  monthStartDay: Scalars['Int']['output'];
  monthlyBudget: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  onboardingAt?: Maybe<Scalars['DateTime']['output']>;
};

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', signIn: { __typename?: 'AuthResponse', accessToken: string, refreshToken: string, user: { __typename?: 'UserWithoutPasswordModel', id: string, name: string, email: string, lang?: string | null, currency: string, onboardingAt?: any | null, monthlyBudget: number, monthStartDay: number } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', signOut: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'UserWithoutPasswordModel', id: string, name: string, email: string, lang?: string | null, currency: string, onboardingAt?: any | null, monthlyBudget: number, monthStartDay: number } };

export type OnboardingMutationVariables = Exact<{
  currency: Scalars['String']['input'];
  monthStartDay: Scalars['Float']['input'];
  monthlyBudget: Scalars['Float']['input'];
}>;


export type OnboardingMutation = { __typename?: 'Mutation', onboarding: { __typename?: 'UserWithoutPasswordModel', id: string, name: string, email: string, lang?: string | null, currency: string, onboardingAt?: any | null, monthlyBudget: number, monthStartDay: number } };

export type RefreshTokensMutationVariables = Exact<{
  refreshToken: Scalars['String']['input'];
}>;


export type RefreshTokensMutation = { __typename?: 'Mutation', refreshTokens: { __typename?: 'AuthResponse', accessToken: string, refreshToken: string, user: { __typename?: 'UserWithoutPasswordModel', id: string, name: string, email: string, lang?: string | null } } };

export type RegistrationMutationVariables = Exact<{
  name: Scalars['String']['input'];
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  lang: Scalars['String']['input'];
}>;


export type RegistrationMutation = { __typename?: 'Mutation', signUp: { __typename?: 'UserWithoutPasswordModel', id: string, name: string, email: string, lang?: string | null } };

export type SettingsGeneralMutationVariables = Exact<{
  name?: InputMaybe<Scalars['String']['input']>;
  lang?: InputMaybe<Scalars['String']['input']>;
  newPassword?: InputMaybe<Scalars['String']['input']>;
  oldPassword?: InputMaybe<Scalars['String']['input']>;
}>;


export type SettingsGeneralMutation = { __typename?: 'Mutation', updateProfile: { __typename?: 'UserWithoutPasswordModel', id: string, name: string, email: string, lang?: string | null, currency: string, onboardingAt?: any | null, monthlyBudget: number, monthStartDay: number } };

export type SettingsStatisticsMutationVariables = Exact<{
  currency?: InputMaybe<Scalars['String']['input']>;
  monthStartDay?: InputMaybe<Scalars['Float']['input']>;
  monthlyBudget?: InputMaybe<Scalars['Float']['input']>;
}>;


export type SettingsStatisticsMutation = { __typename?: 'Mutation', updateProfile: { __typename?: 'UserWithoutPasswordModel', id: string, name: string, email: string, lang?: string | null, currency: string, onboardingAt?: any | null, monthlyBudget: number, monthStartDay: number } };
