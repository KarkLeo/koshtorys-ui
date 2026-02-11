import fetch from 'cross-fetch'
import { ApolloClient } from '@apollo/client/core'
import { InMemoryCache } from '@apollo/client/cache'
import { createHttpLink } from '@apollo/client/link/http'

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT,
  fetch,
  credentials: 'include',
})

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
})

export default client
