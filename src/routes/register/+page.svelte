<script lang="ts">
	import { _, locale } from 'svelte-i18n';
	import { ValidationError } from 'yup';
	import { goto } from '$app/navigation';
	import AuthService from '$lib/services/auth-service';
	import Input from '$lib/kit/Input.svelte';
	import FieldWrapper from '$lib/kit/FieldWrapper.svelte';
	import Button from '$lib/kit/Button.svelte';
	import { registerSchema } from '$lib/validations/register';

	import toast from 'svelte-french-toast';

	const auth = new AuthService();

	let name = '';
	let email = '';
	let password = '';
	let confirmPassword = '';

	let errors: Record<string, string> = {};

	const validateField = (fieldName: string) => async () => {
		try {
			await registerSchema.validateAt(
				fieldName,
				{ name, email, password, confirmPassword },
				{ abortEarly: false }
			);
			const otherErrors = { ...errors };
			delete otherErrors[fieldName];
			errors = otherErrors;
			return true;
			// eslint-disable-next-line
		} catch (validationErrors: any) {
			errors = {
				...errors,
				[fieldName]: (validationErrors as ValidationError).errors[0]
			};
			return false;
		}
	};

	const validateForm = async () => {
		try {
			await registerSchema.validate(
				{ name, email, password, confirmPassword },
				{ abortEarly: false }
			);
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

	const register = async () => {
		try {
			const isValid = await validateForm();
			if (!isValid) return;

			const lang = $locale;
			const data = await auth.signUp(name, email, password, lang || 'en');

			if (data) {
				toast.success($_('register.success'));
				goto('/login');
			}
			// eslint-disable-next-line
		} catch (e: any) {
			try {
				const errorCodes = e.cause.extensions.originalError.errorCodes;
				if (errorCodes) {
					errors = errorCodes;
				}
				// eslint-disable-next-line
			} catch (e: any) {
				toast.error($_('common_errors.server_error'));
			}
		}
	};
</script>

<div class="wrapper">
	<h1 class="title">{$_('register.title')}</h1>
	<p class="description">
		{$_('register.description')}
	</p>

	<form on:submit|preventDefault={register} class="form">
		<FieldWrapper
			required
			label={$_('register.fields.name.label')}
			error={Boolean(errors?.name)}
			message={errors?.name ? $_(`register.fields.name.errors.${errors.name}`) : ''}
		>
			<Input
				bind:value={name}
				placeholder={$_('register.fields.name.placeholder')}
				on:blur={validateField('name')}
				error={Boolean(errors?.name)}
			/>
		</FieldWrapper>
		<FieldWrapper
			required
			label={$_('register.fields.email.label')}
			error={Boolean(errors?.email)}
			message={errors?.email ? $_(`register.fields.email.errors.${errors.email}`) : ''}
		>
			<Input
				bind:value={email}
				type="email"
				placeholder={$_('register.fields.email.placeholder')}
				on:blur={validateField('email')}
				error={Boolean(errors?.email)}
			/>
		</FieldWrapper>
		<FieldWrapper
			required
			label={$_('register.fields.password.label')}
			error={Boolean(errors?.password)}
			message={errors?.password ? $_(`register.fields.password.errors.${errors.password}`) : ''}
		>
			<Input
				bind:value={password}
				type="password"
				placeholder={$_('register.fields.password.placeholder')}
				on:blur={validateField('password')}
				error={Boolean(errors?.password)}
			/>
		</FieldWrapper>
		<FieldWrapper
			required
			label={$_('register.fields.confirmPassword.label')}
			error={Boolean(errors?.confirmPassword)}
			message={errors?.confirmPassword
				? $_(`register.fields.confirmPassword.errors.${errors.confirmPassword}`)
				: ''}
		>
			<Input
				bind:value={confirmPassword}
				type="password"
				placeholder={$_('register.fields.confirmPassword.placeholder')}
				on:blur={validateField('confirmPassword')}
				error={Boolean(errors?.confirmPassword)}
			/>
		</FieldWrapper>

		<div class="buttons">
			<Button type="submit">{$_('register.submit')}</Button>
		</div>
	</form>
	<p class="sub-form">
		{$_('register.sub_form.title')}{' '}
		<a href="/login" class="link">
			{$_('register.sub_form.link')}
		</a>
	</p>
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
