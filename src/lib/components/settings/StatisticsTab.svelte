<script lang="ts">
	import { goto } from '$app/navigation';
	import { ValidationError } from 'yup';
	import { _ } from 'svelte-i18n';

	import { me } from '$lib/store/me';
	import SettingsFieldWrapper from '$lib/kit/SettingsFieldWrapper.svelte';
	import Input from '$lib/kit/Input.svelte';
	import Dropdown from '$lib/kit/Dropdown.svelte';
	import Button from '$lib/kit/Button.svelte';
	import { CURRENCIES } from '$lib/constants/currencies';
	import { onboardingSchema } from '$lib/validations/onboarding';
	import AuthService from '$lib/services/auth-service';
	import toast from 'svelte-french-toast';

	let currency = $me?.currency || CURRENCIES[0];
	let monthStartDay = $me?.monthStartDay || 1;
	let monthlyBudget = $me?.monthlyBudget || 0;

	let errors: Record<string, string> = {};

	const validateField = (fieldName: string) => async () => {
		try {
			await onboardingSchema.validateAt(
				fieldName,
				{ currency, monthlyBudget, monthStartDay },
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
				[fieldName]: validationErrors.errors[0]
			};
			return false;
		}
	};

	const validateForm = async () => {
		try {
			await onboardingSchema.validate(
				{ currency, monthlyBudget, monthStartDay },
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

	const onboarding = async () => {
		try {
			const isValid = await validateForm();
			if (!isValid) return;

			const data = await AuthService.onboarding({ currency, monthStartDay, monthlyBudget });

			if (data) {
				me.set(data);
				toast.success($_('login.success'));
				goto('/dashboard');
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

<form on:submit|preventDefault={onboarding} class="form">
	<SettingsFieldWrapper
		label={$_('settings.fields.currency.label')}
		description={$_('settings.fields.currency.description')}
		error={Boolean(errors?.currency)}
		message={errors?.currency ? $_(`settings.fields.currency.errors.${errors.currency}`) : ''}
	>
		<Dropdown
			options={CURRENCIES}
			placeholder={$_('settings.fields.currency.placeholder')}
			bind:selected={currency}
		/>
	</SettingsFieldWrapper>
	<SettingsFieldWrapper
		label={$_('settings.fields.monthStartDay.label')}
		description={$_('settings.fields.monthStartDay.description')}
		error={Boolean(errors?.monthStartDay)}
		message={errors?.monthStartDay
			? $_(`settings.fields.monthStartDay.errors.${errors.monthStartDay}`)
			: ''}
	>
		<Input
			bind:value={monthStartDay}
			type="number"
			placeholder={$_('settings.fields.monthStartDay.placeholder')}
			on:blur={validateField('monthStartDay')}
			error={Boolean(errors?.monthStartDay)}
		/>
	</SettingsFieldWrapper>
	<SettingsFieldWrapper
		label={$_('settings.fields.monthlyBudget.label')}
		description={$_('settings.fields.monthlyBudget.description')}
		error={Boolean(errors?.monthlyBudget)}
		message={errors?.monthlyBudget
			? $_(`settings.fields.monthlyBudget.errors.${errors.monthlyBudget}`)
			: ''}
	>
		<Input
			bind:value={monthlyBudget}
			type="number"
			placeholder={$_('settings.fields.monthlyBudget.placeholder')}
			on:blur={validateField('monthlyBudget')}
			error={Boolean(errors?.monthlyBudget)}
		/>
	</SettingsFieldWrapper>
	<div class="buttons">
		<Button type="submit">{$_('settings.submit')}</Button>
	</div>
</form>

<style>
	.form :global(.texts) {
		padding-left: var(--spacing-2xl);
	}

	.buttons {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-lg);
		padding: var(--spacing-xl);

		border-top: 1px solid var(--border-secondary);
	}

	@media screen and (min-width: 768px) {
		.buttons {
			padding: var(--spacing-2xl);
		}
	}
</style>
