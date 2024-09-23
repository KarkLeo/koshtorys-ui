<script lang="ts">
  import {goto} from '$app/navigation';
  import AuthService from "../../services/auth-service";

  const auth = new AuthService();

  let authEmail = '';
  let authPassword = '';

  const login = async () => {
    const data = await auth.signIn(
      authEmail,
      authPassword
    )

    if(data) {
      goto('/profile')
    }
  }

</script>

<h1>Авторизация</h1>
<form on:submit|preventDefault={login}>
    <label>
        Email:
        <input bind:value={authEmail} required/>
    </label>
    <label>
        Пароль:
        <input type="password" bind:value={authPassword} required/>
    </label>
    <button type="submit">Авторизоваться</button>
</form>