<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import AuthService from '$lib/services/auth-service';
	import { loginSchema } from '$lib/validations/login';
	import Button from '$lib/kit/Button.svelte';
	import FieldWrapper from '$lib/kit/FieldWrapper.svelte';
	import Input from '$lib/kit/Input.svelte';
	import { ValidationError } from 'yup';
	import toast from 'svelte-french-toast';
	import { me } from '$lib/store/me';

	let email = '';
	let password = '';

	let errors: Record<string, string> = {};

	const validateField = (fieldName: string) => async () => {
		try {
			await loginSchema.validateAt(fieldName, { email, password }, { abortEarly: false });
			const otherErrors = { ...errors };
			delete otherErrors[fieldName];
			errors = otherErrors;
			return true;
			// eslint-disable-next-line
		} catch (validationErrors: any) {
			errors = {
				...errors,
				[fieldName]: validationErrors.errors[0]
			};
			return false;
		}
	};

	const validateForm = async () => {
		try {
			await loginSchema.validate({ email, password }, { abortEarly: false });
			errors = {};
			return true;
			// eslint-disable-next-line
		} catch (validationErrors: any) {
			errors = (validationErrors as ValidationError).inner.reduce(
				// eslint-disable-next-line
				(acc: Record<string, string>, error: any) => {
					if (!acc[error.path]) acc[error.path] = error.message;
					return acc;
				},
				{}
			);
			return false;
		}
	};

	const login = async () => {
		try {
			const isValid = await validateForm();
			if (!isValid) return;

			const data = await AuthService.signIn(email, password);

			if (data) {
				me.set(data.user);
				toast.success($_('login.success'));
				goto('/dashboard');
			}
			// eslint-disable-next-line
		} catch (e: any) {
			try {
				const errorCodes = e.cause.extensions.originalError.errorCodes;
				if (errorCodes) {
					errors = errorCodes;
					if (errorCodes.form) {
						toast.error($_(`login.errors.${errorCodes.form}`));
					}
				}
				// eslint-disable-next-line
			} catch (e: any) {
				toast.error($_('common_errors.server_error'));
			}
		}
	};
</script>

<div class="wrapper">
	<h1 class="title">{$_('login.title')}</h1>
	<p class="description">
		{$_('login.description')}
	</p>

	<form on:submit|preventDefault={login} class="form">
		<FieldWrapper
			required
			label={$_('login.fields.email.label')}
			error={Boolean(errors?.email)}
			message={errors?.email ? $_(`login.fields.email.errors.${errors.email}`) : ''}
		>
			<Input
				bind:value={email}
				type="email"
				placeholder={$_('login.fields.email.placeholder')}
				on:blur={validateField('email')}
				error={Boolean(errors?.email)}
				autocomplete="email"
			/>
		</FieldWrapper>
		<FieldWrapper
			required
			label={$_('login.fields.password.label')}
			error={Boolean(errors?.password)}
			message={errors?.password ? $_(`login.fields.password.errors.${errors.password}`) : ''}
		>
			<Input
				bind:value={password}
				type="password"
				placeholder={$_('login.fields.password.placeholder')}
				on:blur={validateField('password')}
				error={Boolean(errors?.password)}
				autocomplete="current-password"
			/>
		</FieldWrapper>
		<div class="buttons">
			<Button type="submit">{$_('login.submit')}</Button>
		</div>
		<p class="sub-form">
			{$_('login.sub_form.title')}{' '}
			<a href="/register" class="link">
				{$_('login.sub_form.link')}
			</a>
		</p>
	</form>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		justify-content: center;
		max-width: calc(var(--width-xs) + 2 * var(--spacing-xl));
		width: 100%;
		margin: 0 auto;
		flex-grow: 1;
		padding: var(--spacing-xl);
		box-sizing: border-box;
	}

	.title {
		margin: 0 0 var(--spacing-lg);

		font-size: var(--font-size-display-sm);
		line-height: var(--line-height-display-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
	}

	.description {
		margin: 0 0 var(--spacing-4xl);

		font-size: var(--font-size-text-md);
		line-height: var(--line-height-text-md);
		font-weight: var(--font-weight-regular);
		color: var(--text-tertiary);
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.buttons {
		margin-top: var(--spacing-xs);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xl);
	}

	.sub-form {
		margin: var(--spacing-4xl) 0 0;

		font-size: var(--font-size-text-sm);
		line-height: var(--line-height-text-sm);
		font-weight: var(--font-weight-regular);
		color: var(--text-tertiary);
		text-align: center;
	}
	.sub-form a {
		color: var(--fg-brand-primary_alt);
		text-decoration: none;
	}

	@media screen and (min-width: 768px) {
		.wrapper {
			max-width: calc(var(--width-xs) + 2 * var(--spacing-4xl));
			padding: var(--spacing-4xl);
		}
	}
</style>
