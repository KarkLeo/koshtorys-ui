<script lang="ts">
	import { _ } from 'svelte-i18n';
	import Input from '$lib/kit/Input.svelte';
	import SettingsFieldWrapper from '$lib/kit/SettingsFieldWrapper.svelte';
	import { onboardingSchema } from '$lib/validations/onboarding';
	import Button from '$lib/kit/Button.svelte';
	import { me } from '$lib/store/me';

	let errors: Record<string, string> = {};

	let name = $me?.name || '';
	let email = $me?.email || '';
	let newPassword = '';
	let confirmNewPassword = '';
	let oldPassword = '';

	const validateField = (fieldName: string) => async () => {
		try {
			await onboardingSchema.validateAt(
				fieldName,
				{ currency: '', monthlyBudget: 0, monthStartDay: 0 },
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

	const update = () => {
		console.log('update');
	};
</script>

<form on:submit|preventDefault={update} class="form">
	<SettingsFieldWrapper
		label={$_('settings.fields.name.label')}
		description={$_('settings.fields.name.description')}
	>
		<Input bind:value={name} type="text" placeholder={$_('settings.fields.name.placeholder')} />
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
	>
		<div class="inputs">
			<Input
				bind:value={newPassword}
				type="password"
				placeholder={$_('settings.fields.newPassword.placeholder')}
			/>
			<Input
				bind:value={confirmNewPassword}
				type="password"
				placeholder={$_('settings.fields.confirmNewPassword.placeholder')}
			/>
			<Input
				bind:value={oldPassword}
				type="password"
				placeholder={$_('settings.fields.oldPassword.placeholder')}
			/>
		</div>
	</SettingsFieldWrapper>
	<div class="buttons">
		<Button type="submit">{$_('settings.submit')}</Button>
	</div>
</form>

<style>
	.form :global(.texts) {
		padding-left: var(--spacing-2xl);
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
		.buttons {
			padding: var(--spacing-2xl);
		}
	}
</style>
