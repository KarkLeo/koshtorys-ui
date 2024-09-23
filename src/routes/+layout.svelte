<script lang="ts">
  import { setContext } from 'svelte';
  import client from '$lib/apolloClient';

  setContext('apollo', client);
</script>

<slot />
