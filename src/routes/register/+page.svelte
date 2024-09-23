<script lang="ts">
  import {goto} from '$app/navigation';
  import AuthService from "../../services/auth-service";

  const auth = new AuthService();

  let username = '';
  let email = '';
  let password = '';

  const register = async () => {
    const data = await auth.signUp(
      username,
      email,
      password
    )

    if(data) {
      goto('/login')
    }
  }
</script>

<h1>Регистрация</h1>
<form on:submit|preventDefault={register}>
    <label>
        Имя
        пользователя:
        <input bind:value={username} required/>
    </label>
    <label>
        Email:
        <input bind:value={email} required/>
    </label>
    <label>
        Пароль:
        <input type="password" bind:value={password} required/>
    </label>
    <button type="submit">Зарегистрироваться</button>
</form>