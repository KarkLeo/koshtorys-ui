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

	const update = async () => {
		try {
			const isValid = await validateForm();
			if (!isValid) return;

			const data = await AuthService.settingsStatistics({ currency, monthStartDay, monthlyBudget });

			if (data) {
				me.set(data);
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
</script>

<form on:submit|preventDefault={update} class="form">
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
			error={Boolean(errors?.monthlyBudget)}
		/>
	</SettingsFieldWrapper>
	<div class="buttons">
		<Button type="submit">{$_('settings.submit')}</Button>
	</div>
</form>

<style>
	.form :global(.texts),
	.form :global(.control) {
		padding-inline: var(--spacing-2xl);
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
