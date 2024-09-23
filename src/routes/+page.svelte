<script lang="ts">
  import {onMount} from 'svelte';
  import {goto} from '$app/navigation';

  import AuthService from "../services/auth-service";
  import type {AwaitedReturn} from "../utils/types";
  import { useQuery} from "../hook/useApollo";


  import ME from '$lib/graphql/me.graphql';
  import type {MeQuery} from '$lib/graphql/types';
  import {useAsyncData} from "../hook/useAsyncData";

  const auth = new AuthService();

  let user: AwaitedReturn<typeof auth.me> = null
  onMount(async () => {
    user = await auth.me()
    if (user) {
      await goto('/profile')
    }
  })

  // todo remove this
  const t = useQuery<MeQuery>(ME)
  const a = useAsyncData<typeof auth.me>(auth.me.bind(auth))

</script>

<p>{$a?.name}</p>
<p>{$t?.me.name}</p>
{#if user}
    <h1>Привет, {user.name}</h1>
{:else}
    <h1>Привет, гость</h1>
{/if}

<p>Please <a href="/login">login</a> or <a href="/register">register</a>.</p>
