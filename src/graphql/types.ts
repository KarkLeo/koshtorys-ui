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
  _count: ExchangeRateCount;
  base: Scalars['String']['output'];
  date: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  rates: Scalars['JSON']['output'];
  transaction?: Maybe<Array<Transaction>>;
};

export type ExchangeRateCount = {
  __typename?: 'ExchangeRateCount';
  transaction: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createTransaction: Transaction;
  createUser: UserWithoutPasswordModel;
  deleteTransaction: Transaction;
  onboarding: UserWithoutPasswordModel;
  refreshTokens: AuthResponse;
  signIn: AuthResponse;
  signOut: Scalars['Boolean']['output'];
  signUp: UserWithoutPasswordModel;
  updateProfile: UserWithoutPasswordModel;
  updateTransaction: Transaction;
};


export type MutationCreateTransactionArgs = {
  transactionData: TransactionInput;
};


export type MutationCreateUserArgs = {
  email: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
};


export type MutationDeleteTransactionArgs = {
  id: Scalars['Float']['input'];
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


export type MutationUpdateTransactionArgs = {
  id: Scalars['Float']['input'];
  transactionData: TransactionInput;
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
  transactions: Array<Transaction>;
};


export type QueryExchangeRateArgs = {
  date: Scalars['DateTime']['input'];
};


export type QueryTransactionsArgs = {
  date?: InputMaybe<Scalars['DateTime']['input']>;
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

export type Transaction = {
  __typename?: 'Transaction';
  amount: Scalars['Float']['output'];
  categoryId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  date: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  exchangeRate: ExchangeRate;
  exchangeRateId: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['Int']['output'];
};

export type TransactionInput = {
  amount: Scalars['Float']['input'];
  categoryId: Scalars['String']['input'];
  currency: Scalars['String']['input'];
  date: Scalars['DateTime']['input'];
  description: Scalars['String']['input'];
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

export type User = {
  __typename?: 'User';
  _count: UserCount;
  currency: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lang: Scalars['String']['output'];
  monthStartDay: Scalars['Int']['output'];
  monthlyBudget: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  onboardingAt?: Maybe<Scalars['DateTime']['output']>;
  password: Scalars['String']['output'];
  refreshToken?: Maybe<Scalars['String']['output']>;
  transaction?: Maybe<Array<Transaction>>;
};

export type UserCount = {
  __typename?: 'UserCount';
  transaction: Scalars['Int']['output'];
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

export type CreateTransactionMutationVariables = Exact<{
  transactionData: TransactionInput;
}>;


export type CreateTransactionMutation = { __typename?: 'Mutation', createTransaction: { __typename?: 'Transaction', id: string, amount: number, categoryId?: string | null, date: any, description?: string | null, exchangeRate: { __typename?: 'ExchangeRate', id: string, base: string, date: any, rates: any } } };

export type DeleteTransactionMutationVariables = Exact<{
  transactionId: Scalars['Float']['input'];
}>;


export type DeleteTransactionMutation = { __typename?: 'Mutation', deleteTransaction: { __typename?: 'Transaction', id: string } };

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

export type TransactionsQueryVariables = Exact<{
  date?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type TransactionsQuery = { __typename?: 'Query', transactions: Array<{ __typename?: 'Transaction', id: string, amount: number, currency: string, date: any, description?: string | null, categoryId?: string | null, exchangeRate: { __typename?: 'ExchangeRate', id: string, base: string, date: any, rates: any } }> };

export type UpdateTransactionMutationVariables = Exact<{
  transactionId: Scalars['Float']['input'];
  transactionData: TransactionInput;
}>;


export type UpdateTransactionMutation = { __typename?: 'Mutation', updateTransaction: { __typename?: 'Transaction', id: string, amount: number, categoryId?: string | null, date: any, description?: string | null, exchangeRate: { __typename?: 'ExchangeRate', id: string, base: string, date: any, rates: any } } };
