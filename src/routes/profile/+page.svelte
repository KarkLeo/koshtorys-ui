<script lang="ts">
  import AuthService from "../../services/auth-service";
  import type {AwaitedReturn} from "../../utils/types";
  import {onMount} from "svelte";
  import {goto} from "$app/navigation";

  const auth = new AuthService();

  let user: AwaitedReturn<typeof auth.me> = null
  onMount(async () => {
    console.log('onMount')
    try {
      user = await auth.me()
      if (!user) {
        await goto('/')
      }
    } catch (e) {
      await goto('/')
    }
  })

  async function handleLogout() {
    try {
      await auth.signOut();
    } finally {
      await goto('/');
    }
  }
</script>

{#if user}
    <h1>Привет, {user.name}</h1>
{:else}
    <h1>Привет, гость</h1>
{/if}

<button on:click={handleLogout}>Logout</button>