<script lang="ts">
	import { _, locale, locales } from 'svelte-i18n';
	import Input from '$lib/kit/Input.svelte';
	import SettingsFieldWrapper from '$lib/kit/SettingsFieldWrapper.svelte';
	import Button from '$lib/kit/Button.svelte';
	import { me } from '$lib/store/me';
	import settingsGeneralSchema from '$lib/validations/settings.general';
	import type { ValidationError } from 'yup';
	import Dropdown from '$lib/kit/Dropdown.svelte';
	import toast from 'svelte-french-toast';
	import AuthService from '$lib/services/auth-service';

	let errors: Record<string, string> = {};

	let name = $me?.name || '';
	let email = $me?.email || '';
	let lang = $me?.lang || '';
	let newPassword = '';
	let confirmNewPassword = '';
	let oldPassword = '';

	const getLangLabel = (locale: string) => {
		switch (locale) {
			case 'en':
				return 'English';
			case 'uk-UA':
				return 'Українська';
			default:
				return locale;
		}
	};

	const validateForm = async () => {
		try {
			await settingsGeneralSchema.validate(
				{ name, newPassword, confirmNewPassword, oldPassword, lang },
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

	const update = async () => {
		try {
			const isValid = await validateForm();
			if (!isValid) return;

			const data = await AuthService.settingsGeneral({
				name,
				lang,
				newPassword,
				oldPassword
			});

			if (data) {
				me.set(data);

				if (data.lang === 'en' || data.lang === 'uk-UA') {
					locale.set(data.lang);
				}

				toast.success($_('settings.success'));
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

	$: passwordMessage = [
		errors?.newPassword ? $_(`settings.fields.newPassword.errors.${errors?.newPassword}`) : '',
		errors?.confirmNewPassword
			? $_(`settings.fields.confirmNewPassword.errors.${errors?.confirmNewPassword}`)
			: '',
		errors?.oldPassword ? $_(`settings.fields.oldPassword.errors.${errors?.oldPassword}`) : ''
	]
		.filter(Boolean)
		.join('. ');

	$: isChanged =
		name !== $me?.name || lang !== $me?.lang || newPassword || confirmNewPassword || oldPassword;
</script>

<form on:submit|preventDefault={update} class="form">
	<SettingsFieldWrapper
		label={$_('settings.fields.lang.label')}
		description={$_('settings.fields.lang.description')}
		error={Boolean(errors?.lang)}
		message={errors?.lang ? $_(`settings.fields.lang.errors.${errors?.lang}`) : ''}
	>
		<Dropdown bind:selected={lang} options={$locales} getOptionLabel={getLangLabel} />
	</SettingsFieldWrapper>
	<SettingsFieldWrapper
		label={$_('settings.fields.name.label')}
		description={$_('settings.fields.name.description')}
		error={Boolean(errors?.name)}
		message={errors?.name ? $_(`settings.fields.name.errors.${errors?.name}`) : ''}
	>
		<Input
			bind:value={name}
			type="text"
			placeholder={$_('settings.fields.name.placeholder')}
			error={Boolean(errors?.name)}
		/>
	</SettingsFieldWrapper>
	<SettingsFieldWrapper
		label={$_('settings.fields.email.label')}
		description={$_('settings.fields.email.description')}
	>
		<Input bind:value={email} type="email" disabled />
	</SettingsFieldWrapper>
	<SettingsFieldWrapper
		label={$_('settings.fields.newPassword.label')}
		description={$_('settings.fields.newPassword.description')}
		error={Boolean(errors?.newPassword || errors?.confirmNewPassword || errors?.oldPassword)}
		message={passwordMessage}
	>
		<div class="inputs">
			<Input
				bind:value={newPassword}
				type="password"
				placeholder={$_('settings.fields.newPassword.placeholder')}
				error={Boolean(errors?.newPassword)}
			/>
			<Input
				bind:value={confirmNewPassword}
				type="password"
				placeholder={$_('settings.fields.confirmNewPassword.placeholder')}
				error={Boolean(errors?.confirmNewPassword)}
			/>
			<Input
				bind:value={oldPassword}
				type="password"
				placeholder={$_('settings.fields.oldPassword.placeholder')}
				error={Boolean(errors?.oldPassword)}
			/>
		</div>
	</SettingsFieldWrapper>
	<div class="buttons">
		<Button type="submit" disabled={!isChanged}>{$_('settings.submit')}</Button>
	</div>
</form>

<style>
	.form :global(.texts),
	.form :global(.control) {
		padding-inline: var(--spacing-2xl);
	}

	.inputs {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.buttons {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-lg);
		padding: var(--spacing-xl);

		border-top: 1px solid var(--border-secondary);
	}

	@media screen and (min-width: 768px) {
		.form :global(.texts) {
			padding-inline: var(--spacing-2xl) 0;
		}
		.form :global(.control) {
			padding-inline: 0 var(--spacing-2xl);
		}

		.buttons {
			padding: var(--spacing-2xl);
		}
	}
</style>
