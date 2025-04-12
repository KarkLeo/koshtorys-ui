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
  canselRepeatingPlanning: Planning;
  createPlanning: Planning;
  createTransaction: Transaction;
  createUser: UserWithoutPasswordModel;
  deletePlanning: Planning;
  deleteTransaction: Transaction;
  onboarding: UserWithoutPasswordModel;
  refreshTokens: AuthResponse;
  repeatPlanning: Planning;
  signIn: AuthResponse;
  signOut: Scalars['Boolean']['output'];
  signUp: UserWithoutPasswordModel;
  updatePlanning: Planning;
  updateProfile: UserWithoutPasswordModel;
  updateTransaction: Transaction;
};


export type MutationCanselRepeatingPlanningArgs = {
  planningId: Scalars['Float']['input'];
};


export type MutationCreatePlanningArgs = {
  planningData: PlanningInput;
};


export type MutationCreateTransactionArgs = {
  transactionData: TransactionInput;
};


export type MutationCreateUserArgs = {
  email: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
};


export type MutationDeletePlanningArgs = {
  planningId: Scalars['Float']['input'];
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


export type MutationRepeatPlanningArgs = {
  monthIndex: Scalars['Float']['input'];
  planningId: Scalars['Float']['input'];
  year: Scalars['Float']['input'];
};


export type MutationSignInArgs = {
  signInData: SignInInput;
};


export type MutationSignUpArgs = {
  signUpData: SignUpInput;
};


export type MutationUpdatePlanningArgs = {
  planningData: PlanningInput;
  planningId: Scalars['Float']['input'];
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

export type Planning = {
  __typename?: 'Planning';
  _count: PlanningCount;
  amount: Scalars['Float']['output'];
  categoryId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  date?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  monthIndex: Scalars['Int']['output'];
  parentPlanning?: Maybe<Planning>;
  parentPlanningId?: Maybe<Scalars['Int']['output']>;
  parentPlannings?: Maybe<Array<Planning>>;
  repeat: Scalars['Boolean']['output'];
  repeatedPlanning?: Maybe<Planning>;
  repeatedPlanningId?: Maybe<Scalars['Int']['output']>;
  repeatedPlannings?: Maybe<Array<Planning>>;
  transactions?: Maybe<Array<Transaction>>;
  type: PlanningType;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['Int']['output'];
  year: Scalars['Int']['output'];
};

export type PlanningCount = {
  __typename?: 'PlanningCount';
  parentPlannings: Scalars['Int']['output'];
  repeatedPlannings: Scalars['Int']['output'];
  transactions: Scalars['Int']['output'];
};

export type PlanningInput = {
  amount: Scalars['Float']['input'];
  categoryId: Scalars['String']['input'];
  currency: Scalars['String']['input'];
  date?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  monthIndex: Scalars['Float']['input'];
  parentPlanningId?: InputMaybe<Scalars['Float']['input']>;
  repeat?: InputMaybe<Scalars['Boolean']['input']>;
  repeatedPlanningId?: InputMaybe<Scalars['Float']['input']>;
  type: PlanningType;
  year: Scalars['Float']['input'];
};

export enum PlanningType {
  Category = 'CATEGORY',
  Transaction = 'TRANSACTION'
}

export type Query = {
  __typename?: 'Query';
  exchangeRate: ExchangeRate;
  exchangeRates: Array<ExchangeRate>;
  me: UserWithoutPasswordModel;
  planning: Array<Planning>;
  repeatingPlanning: Array<Planning>;
  transactions: Array<Transaction>;
  transactionsByCategory: Array<TransactionsByCategoriesOutput>;
  transactionsByMonthDay: Array<TransactionsByMonthDayOutput>;
};


export type QueryExchangeRateArgs = {
  date: Scalars['DateTime']['input'];
};


export type QueryPlanningArgs = {
  monthIndex: Scalars['Float']['input'];
  year: Scalars['Float']['input'];
};


export type QueryRepeatingPlanningArgs = {
  monthIndex: Scalars['Float']['input'];
  year: Scalars['Float']['input'];
};


export type QueryTransactionsArgs = {
  endDate: Scalars['DateTime']['input'];
  startDate: Scalars['DateTime']['input'];
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
  planning?: Maybe<Planning>;
  planningId?: Maybe<Scalars['Int']['output']>;
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
  planningId?: InputMaybe<Scalars['Float']['input']>;
};

export type TransactionsByCategoriesOutput = {
  __typename?: 'TransactionsByCategoriesOutput';
  average: Scalars['Float']['output'];
  categoryId: Scalars['String']['output'];
};

export type TransactionsByMonthDayOutput = {
  __typename?: 'TransactionsByMonthDayOutput';
  average: Scalars['Float']['output'];
  count_of_month: Scalars['Int']['output'];
  period_index: Scalars['Int']['output'];
  total: Scalars['Float']['output'];
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
  Planning?: Maybe<Array<Planning>>;
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
  Planning: Scalars['Int']['output'];
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

export type CanselRepeatingPlanningMutationVariables = Exact<{
  planningId: Scalars['Float']['input'];
}>;


export type CanselRepeatingPlanningMutation = { __typename?: 'Mutation', canselRepeatingPlanning: { __typename?: 'Planning', id: string, amount: number, currency: string, date?: any | null, description?: string | null, categoryId: string, repeat: boolean, type: PlanningType, year: number, monthIndex: number, repeatedPlanningId?: number | null, parentPlanningId?: number | null, transactions?: Array<{ __typename?: 'Transaction', id: string, amount: number, currency: string, exchangeRate: { __typename?: 'ExchangeRate', rates: any } }> | null } };

export type CreatePlanningMutationVariables = Exact<{
  planningData: PlanningInput;
}>;


export type CreatePlanningMutation = { __typename?: 'Mutation', createPlanning: { __typename?: 'Planning', id: string, amount: number, currency: string, date?: any | null, description?: string | null, categoryId: string, repeat: boolean, type: PlanningType, year: number, monthIndex: number, repeatedPlanningId?: number | null, parentPlanningId?: number | null, transactions?: Array<{ __typename?: 'Transaction', id: string, amount: number, currency: string, exchangeRate: { __typename?: 'ExchangeRate', rates: any } }> | null } };

export type CreateTransactionMutationVariables = Exact<{
  transactionData: TransactionInput;
}>;


export type CreateTransactionMutation = { __typename?: 'Mutation', createTransaction: { __typename?: 'Transaction', id: string, amount: number, currency: string, date: any, description?: string | null, categoryId?: string | null, planningId?: number | null, exchangeRate: { __typename?: 'ExchangeRate', id: string, base: string, date: any, rates: any } } };

export type DeletePlanningMutationVariables = Exact<{
  planningId: Scalars['Float']['input'];
}>;


export type DeletePlanningMutation = { __typename?: 'Mutation', deletePlanning: { __typename?: 'Planning', id: string, monthIndex: number, year: number } };

export type DeleteTransactionMutationVariables = Exact<{
  transactionId: Scalars['Float']['input'];
}>;


export type DeleteTransactionMutation = { __typename?: 'Mutation', deleteTransaction: { __typename?: 'Transaction', id: string, date: any, planningId?: number | null } };

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

export type PlanningExchangeRateQueryVariables = Exact<{
  exchangeDate: Scalars['DateTime']['input'];
}>;


export type PlanningExchangeRateQuery = { __typename?: 'Query', exchangeRate: { __typename?: 'ExchangeRate', id: string, base: string, date: any, rates: any } };

export type PlanningQueryVariables = Exact<{
  monthIndex: Scalars['Float']['input'];
  year: Scalars['Float']['input'];
}>;


export type PlanningQuery = { __typename?: 'Query', planning: Array<{ __typename?: 'Planning', id: string, amount: number, currency: string, date?: any | null, description?: string | null, categoryId: string, repeat: boolean, type: PlanningType, year: number, monthIndex: number, repeatedPlanningId?: number | null, parentPlanningId?: number | null, transactions?: Array<{ __typename?: 'Transaction', id: string, amount: number, currency: string, exchangeRate: { __typename?: 'ExchangeRate', rates: any } }> | null }> };

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

export type RepeatPlanningMutationVariables = Exact<{
  planningId: Scalars['Float']['input'];
  monthIndex: Scalars['Float']['input'];
  year: Scalars['Float']['input'];
}>;


export type RepeatPlanningMutation = { __typename?: 'Mutation', repeatPlanning: { __typename?: 'Planning', id: string, amount: number, currency: string, date?: any | null, description?: string | null, categoryId: string, repeat: boolean, type: PlanningType, year: number, monthIndex: number, repeatedPlanningId?: number | null, parentPlanningId?: number | null, transactions?: Array<{ __typename?: 'Transaction', id: string, amount: number, currency: string, exchangeRate: { __typename?: 'ExchangeRate', rates: any } }> | null } };

export type RepeatingPlanningQueryVariables = Exact<{
  monthIndex: Scalars['Float']['input'];
  year: Scalars['Float']['input'];
}>;


export type RepeatingPlanningQuery = { __typename?: 'Query', repeatingPlanning: Array<{ __typename?: 'Planning', id: string, amount: number, currency: string, date?: any | null, description?: string | null, categoryId: string, repeat: boolean, type: PlanningType, year: number, monthIndex: number, repeatedPlanningId?: number | null, parentPlanningId?: number | null }> };

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

export type TransactionStatisticQueryVariables = Exact<{ [key: string]: never; }>;


export type TransactionStatisticQuery = { __typename?: 'Query', transactionsByCategory: Array<{ __typename?: 'TransactionsByCategoriesOutput', categoryId: string, average: number }>, transactionsByMonthDay: Array<{ __typename?: 'TransactionsByMonthDayOutput', period_index: number, count_of_month: number, total: number, average: number }> };

export type TransactionsQueryVariables = Exact<{
  startDate: Scalars['DateTime']['input'];
  endDate: Scalars['DateTime']['input'];
}>;


export type TransactionsQuery = { __typename?: 'Query', transactions: Array<{ __typename?: 'Transaction', id: string, amount: number, currency: string, date: any, description?: string | null, categoryId?: string | null, planningId?: number | null, exchangeRate: { __typename?: 'ExchangeRate', id: string, base: string, date: any, rates: any } }> };

export type UpdatePlanningMutationVariables = Exact<{
  planningData: PlanningInput;
  planningId: Scalars['Float']['input'];
}>;


export type UpdatePlanningMutation = { __typename?: 'Mutation', updatePlanning: { __typename?: 'Planning', id: string, amount: number, currency: string, date?: any | null, description?: string | null, categoryId: string, repeat: boolean, type: PlanningType, year: number, monthIndex: number, repeatedPlanningId?: number | null, parentPlanningId?: number | null, transactions?: Array<{ __typename?: 'Transaction', id: string, amount: number, currency: string, exchangeRate: { __typename?: 'ExchangeRate', rates: any } }> | null } };

export type UpdateTransactionMutationVariables = Exact<{
  transactionId: Scalars['Float']['input'];
  transactionData: TransactionInput;
}>;


export type UpdateTransactionMutation = { __typename?: 'Mutation', updateTransaction: { __typename?: 'Transaction', id: string, amount: number, currency: string, date: any, description?: string | null, categoryId?: string | null, planningId?: number | null, exchangeRate: { __typename?: 'ExchangeRate', id: string, base: string, date: any, rates: any } } };
