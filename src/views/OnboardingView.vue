<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { ValidationError } from 'yup'

import { CURRENCIES } from '@/constants/currencies.ts'
import { onboardingSchema } from '@/validations/onboarding.ts'
import { usesOnboarding } from '@/hooks/auth-hooks.ts'
import { toast } from 'vue-sonner'
import { ApiError } from '@/api/client'

import KitSettingsFieldWrapper from '@/components/kit/KitSettingsFieldWrapper.vue'
import KitDropdown from '@/components/kit/KitDropdown.vue'
import KitInput from '@/components/kit/KitInput.vue'
import KitButton from '@/components/kit/KitButton.vue'

const { onboarding } = usesOnboarding()
const router = useRouter()
const { t } = useI18n()

const currency = ref<(typeof CURRENCIES)[number]>(CURRENCIES[0])
const monthStartDay = ref<string>('1')
const monthlyBudget = ref<string>('0')

const errors = ref<Record<string, string>>({})

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
      toast.success(t('onboarding.success'))
      await router.push('/dashboard')
    }
    // eslint-disable-next-line
  } catch (e: any) {
    if (e instanceof ApiError && e.errorCodes) {
      errors.value = e.errorCodes
    } else {
      toast.error(t('common_errors.server_error'))
    }
  }
}
</script>
<template>
  <div class="form-wrapper">
    <div class="inner">
      <h1 class="title">{{ $t('onboarding.title') }}</h1>

      <form @submit.prevent="handleOnboarding" class="form">
        <KitSettingsFieldWrapper
          :label="$t('onboarding.fields.currency.label')"
          :description="$t('onboarding.fields.currency.description')"
          :error="Boolean(errors?.currency)"
          :message="
            errors?.currency ? $t(`onboarding.fields.currency.errors.${errors.currency}`) : ''
          "
        >
          <KitDropdown
            :options="CURRENCIES"
            :placeholder="$t('onboarding.fields.currency.placeholder')"
            v-model="currency"
          />
        </KitSettingsFieldWrapper>
        <KitSettingsFieldWrapper
          :label="$t('onboarding.fields.monthStartDay.label')"
          :description="$t('onboarding.fields.monthStartDay.description')"
          :error="Boolean(errors?.monthStartDay)"
          :message="
            errors?.monthStartDay
              ? $t(`onboarding.fields.monthStartDay.errors.${errors.monthStartDay}`)
              : ''
          "
        >
          <KitInput
            v-model="monthStartDay"
            type="number"
            :placeholder="$t('onboarding.fields.monthStartDay.placeholder')"
            @blur="validateField('monthStartDay')"
            :error="Boolean(errors?.monthStartDay)"
          />
        </KitSettingsFieldWrapper>
        <KitSettingsFieldWrapper
          :label="$t('onboarding.fields.monthlyBudget.label')"
          :description="$t('onboarding.fields.monthlyBudget.description')"
          :error="Boolean(errors?.monthlyBudget)"
          :message="
            errors?.monthlyBudget
              ? $t(`onboarding.fields.monthlyBudget.errors.${errors.monthlyBudget}`)
              : ''
          "
        >
          <KitInput
            v-model="monthlyBudget"
            type="number"
            :placeholder="$t('onboarding.fields.monthlyBudget.placeholder')"
            @blur="validateField('monthlyBudget')"
            :error="Boolean(errors?.monthlyBudget)"
          />
        </KitSettingsFieldWrapper>
        <div class="buttons">
          <KitButton type="submit">{{ $t('onboarding.submit') }}</KitButton>
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
  .form-wrapper {
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
