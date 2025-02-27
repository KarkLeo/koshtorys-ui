import { ApolloClient, Observable } from '@apollo/client/core'
import { InMemoryCache } from '@apollo/client/cache'
import { createHttpLink } from '@apollo/client/link/http'
import { onError } from '@apollo/client/link/error'
import { setContext } from '@apollo/client/link/context'
import { ApolloLink } from '@apollo/client/link/core'
import fetch from 'cross-fetch'

import TokensService from '@/services/tokens-service'
import type { RefreshTokensMutation, RefreshTokensMutationVariables } from '@/graphql/types'
import REFRESH_TOKENS from '@/graphql/refresh-tokens.graphql'

let isRefreshing = false
let retryCount = 0
const maxRetries = 6
// eslint-disable-next-line
let pendingRequests: any[] = []

const resolvePendingRequests = () => {
  pendingRequests.forEach((callback) => callback())
  pendingRequests = []
}

function rejectPendingRequests(error: Error) {
  pendingRequests.forEach((callback) => callback(error))
  pendingRequests = []
}

export const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      console.error(`[GraphQL error]: Message: ${err.message}, Path: ${err.path}`)

      if (err.extensions?.code === 'UNAUTHENTICATED' && err.path?.[0] !== 'refreshTokens') {
        if (!isRefreshing && retryCount < maxRetries) {
          isRefreshing = true
          retryCount++
          const refreshToken = TokensService.getRefreshToken()
          if (!refreshToken) {
            TokensService.clearTokens()
            rejectPendingRequests(new Error('Refresh tokens is empty'))
            isRefreshing = false
            return
          }
          client
            .mutate<RefreshTokensMutation, RefreshTokensMutationVariables>({
              mutation: REFRESH_TOKENS,
              variables: {
                refreshToken,
              },
              fetchPolicy: 'no-cache',
            })
            .then(({ data }) => {
              if (data) {
                TokensService.setTokens(
                  data.refreshTokens.accessToken,
                  data.refreshTokens.refreshToken,
                )
                retryCount = 0
                resolvePendingRequests()
              } else {
                TokensService.clearTokens()
                rejectPendingRequests(new Error('Failed to refresh tokens'))
              }
            })
            .catch((error) => {
              TokensService.clearTokens()
              rejectPendingRequests(error)
            })
            .finally(() => {
              isRefreshing = false
            })
        }

        return new Observable((observer) => {
          pendingRequests.push(() => {
            const accessToken = TokensService.getAccessToken()
            operation.setContext(({ headers = {} }) => ({
              headers: {
                ...headers,
                authorization: accessToken ? `Bearer ${accessToken}` : '',
              },
            }))
            forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            })
          })
        })
      } else {
        return forward(operation)
      }
    }
  }
})

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT,
  fetch,
})

export const authLink = setContext((_, { headers }) => {
  const token = TokensService.getAccessToken()
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
})

export default client
