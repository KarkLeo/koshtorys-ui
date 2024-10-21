<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { ValidationError } from 'yup';
	import { _ } from 'svelte-i18n';

	import { me } from '$lib/store/me';
	import SettingsFieldWrapper from '$lib/kit/SettingsFieldWrapper.svelte';
	import Input from '$lib/kit/Input.svelte';
	import Dropdown from '$lib/kit/Dropdown.svelte';
	import Button from '$lib/kit/Button.svelte';
	import { ONBOARDING_UPDATED_AT } from '$lib/constants/meta';
	import { CURRENCIES } from '$lib/constants/currencies';
	import { onboardingSchema } from '$lib/validations/onboarding';
	import AuthService from '$lib/services/auth-service';
	import toast from 'svelte-french-toast';

	onMount(async function () {
		// Redirect to Profile page
		if ($me?.onboardingAt && new Date($me?.onboardingAt) >= new Date(ONBOARDING_UPDATED_AT)) {
			await goto('/dashboard', { replaceState: true });
		}
	});

	let currency = CURRENCIES[0];
	let monthStartDay = 1;
	let monthlyBudget = 0;

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
		console.log('onboarding');
		try {
			const isValid = await validateForm();
			console.log(isValid);
			if (!isValid) return;

			const data = await AuthService.onboarding({ currency, monthStartDay, monthlyBudget });

			if (data) {
				me.set(data);
				toast.success($_('onboarding.success'));
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

<div class="wrapper">
	<div class="inner">
		<h1 class="title">{$_('onboarding.title')}</h1>

		<form on:submit|preventDefault={onboarding} class="form">
			<SettingsFieldWrapper
				label={$_('onboarding.fields.currency.label')}
				description={$_('onboarding.fields.currency.description')}
				error={Boolean(errors?.currency)}
				message={errors?.currency ? $_(`onboarding.fields.currency.errors.${errors.currency}`) : ''}
			>
				<Dropdown
					options={CURRENCIES}
					placeholder={$_('onboarding.fields.currency.placeholder')}
					bind:selected={currency}
				/>
			</SettingsFieldWrapper>
			<SettingsFieldWrapper
				label={$_('onboarding.fields.monthStartDay.label')}
				description={$_('onboarding.fields.monthStartDay.description')}
				error={Boolean(errors?.monthStartDay)}
				message={errors?.monthStartDay
					? $_(`onboarding.fields.monthStartDay.errors.${errors.monthStartDay}`)
					: ''}
			>
				<Input
					bind:value={monthStartDay}
					type="number"
					placeholder={$_('onboarding.fields.monthStartDay.placeholder')}
					on:blur={validateField('monthStartDay')}
					error={Boolean(errors?.monthStartDay)}
				/>
			</SettingsFieldWrapper>
			<SettingsFieldWrapper
				label={$_('onboarding.fields.monthlyBudget.label')}
				description={$_('onboarding.fields.monthlyBudget.description')}
				error={Boolean(errors?.monthlyBudget)}
				message={errors?.monthlyBudget
					? $_(`onboarding.fields.monthlyBudget.errors.${errors.monthlyBudget}`)
					: ''}
			>
				<Input
					bind:value={monthlyBudget}
					type="number"
					placeholder={$_('onboarding.fields.monthlyBudget.placeholder')}
					on:blur={validateField('monthlyBudget')}
					error={Boolean(errors?.monthlyBudget)}
				/>
			</SettingsFieldWrapper>
			<div class="buttons">
				<Button type="submit">{$_('onboarding.submit')}</Button>
			</div>
		</form>
	</div>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		flex-grow: 1;
		padding: var(--spacing-xl);
		box-sizing: border-box;
	}

	.inner {
		width: 100%;
		max-width: var(--container-max-width-desktop);
		margin: var(--spacing-xl);
		padding: var(--spacing-xl);
		box-sizing: border-box;

		background-color: var(--bg-primary_alt);
		border: 1px solid var(--border-secondary);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-xs);
	}

	.title {
		margin: 0 0 var(--spacing-3xl);

		font-size: var(--font-size-display-xs);
		line-height: var(--line-height-display-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
	}

	.buttons {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-lg);
		padding-top: var(--spacing-xl);

		border-top: 1px solid var(--border-secondary);
	}

	@media screen and (min-width: 768px) {
		.wrapper {
			padding: var(--spacing-3xl);
		}

		.inner {
			margin: var(--spacing-3xl);
			padding: var(--spacing-3xl);
		}

		.title {
			margin: 0 0 var(--spacing-4xl);

			font-size: var(--font-size-display-sm);
			line-height: var(--line-height-display-sm);
		}

		.buttons {
			padding-top: var(--spacing-2xl);
		}
	}
</style>
