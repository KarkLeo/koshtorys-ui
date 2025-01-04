<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { ValidationError } from 'yup'

import { CURRENCIES } from '@/constants/currencies.ts'
import { onboardingSchema } from '@/validations/onboarding.ts'
import { useMe, usesOnboarding } from '@/hooks/auth-hooks.ts'

import KitSettingsFieldWrapper from '@/components/kit/KitSettingsFieldWrapper.vue'
import KitDropdown from '@/components/kit/KitDropdown.vue'
import KitInput from '@/components/kit/KitInput.vue'
import KitButton from '@/components/kit/KitButton.vue'

const currency = ref<(typeof CURRENCIES)[number]>(CURRENCIES[0])
const monthStartDay = ref<string>('1')
const monthlyBudget = ref<string>('0')

const errors = ref<Record<string, string>>({})

const { onboarding } = usesOnboarding()
const { refreshMe } = useMe()
const router = useRouter()

const validateField = (fieldName: string) => async () => {
  try {
    await onboardingSchema.validateAt(
      fieldName,
      {
        currency: currency.value,
        monthlyBudget: Number(monthlyBudget.value),
        monthStartDay: Number(monthStartDay.value),
      },
      { abortEarly: false },
    )
    const otherErrors = { ...errors.value }
    delete otherErrors[fieldName]
    errors.value = otherErrors
    return true
    // eslint-disable-next-line
  } catch (validationErrors: any) {
    errors.value = {
      ...errors.value,
      [fieldName]: validationErrors.errors[0],
    }
    return false
  }
}

const validateForm = async () => {
  try {
    await onboardingSchema.validate(
      {
        currency: currency.value,
        monthlyBudget: Number(monthlyBudget.value),
        monthStartDay: Number(monthStartDay.value),
      },
      { abortEarly: false },
    )
    errors.value = {}
    return true
    // eslint-disable-next-line
  } catch (validationErrors: any) {
    errors.value = (validationErrors as ValidationError).inner.reduce(
      // eslint-disable-next-line
      (acc: Record<string, string>, error: any) => {
        if (!acc[error.path]) acc[error.path] = error.message
        return acc
      },
      {},
    )
    return false
  }
}

const handleOnboarding = async () => {
  try {
    const isValid = await validateForm()
    if (!isValid) return

    const data = await onboarding({
      currency: currency.value,
      monthStartDay: Number(monthStartDay.value),
      monthlyBudget: Number(monthlyBudget.value),
    })

    if (data) {
      refreshMe()
      // toast.success($_('onboarding.success')) // todo add toast
      await router.push('/dashboard')
    }
    // eslint-disable-next-line
  } catch (e: any) {
    try {
      const errorCodes = e.cause.extensions.originalError.errorCodes
      if (errorCodes) {
        errors.value = errorCodes
      }
      // eslint-disable-next-line
    } catch (e: any) {
      // toast.error($_('common_errors.server_error')) // todo add toast
    }
  }
}
</script>
<template>
  <div class="form-wrapper">
    <div class="inner">
      <h1 class="title">{{ $t('onboarding.title') }}</h1>

      <form @submit.prevent="handleOnboarding" class="form">
        <kit-settings-field-wrapper
          :label="$t('onboarding.fields.currency.label')"
          :description="$t('onboarding.fields.currency.description')"
          :error="Boolean(errors?.currency)"
          :message="
            errors?.currency ? $t(`onboarding.fields.currency.errors.${errors.currency}`) : ''
          "
        >
          <kit-dropdown
            :options="CURRENCIES"
            :placeholder="$t('onboarding.fields.currency.placeholder')"
            v-model="currency"
          />
        </kit-settings-field-wrapper>
        <kit-settings-field-wrapper
          :label="$t('onboarding.fields.monthStartDay.label')"
          :description="$t('onboarding.fields.monthStartDay.description')"
          :error="Boolean(errors?.monthStartDay)"
          :message="
            errors?.monthStartDay
              ? $t(`onboarding.fields.monthStartDay.errors.${errors.monthStartDay}`)
              : ''
          "
        >
          <kit-input
            v-model="monthStartDay"
            type="number"
            :placeholder="$t('onboarding.fields.monthStartDay.placeholder')"
            @blur="validateField('monthStartDay')"
            :error="Boolean(errors?.monthStartDay)"
          />
        </kit-settings-field-wrapper>
        <kit-settings-field-wrapper
          :label="$t('onboarding.fields.monthlyBudget.label')"
          :description="$t('onboarding.fields.monthlyBudget.description')"
          :error="Boolean(errors?.monthlyBudget)"
          :message="
            errors?.monthlyBudget
              ? $t(`onboarding.fields.monthlyBudget.errors.${errors.monthlyBudget}`)
              : ''
          "
        >
          <kit-input
            v-model="monthlyBudget"
            type="number"
            :placeholder="$t('onboarding.fields.monthlyBudget.placeholder')"
            @blur="validateField('monthlyBudget')"
            :error="Boolean(errors?.monthlyBudget)"
          />
        </kit-settings-field-wrapper>
        <div class="buttons">
          <kit-button type="submit">{{ $t('onboarding.submit') }}</kit-button>
        </div>
      </form>
    </div>
  </div>
</template>
<style scoped>
.form-wrapper {
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
