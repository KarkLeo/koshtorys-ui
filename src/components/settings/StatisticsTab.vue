<script setup lang="ts">
import { computed, ref } from 'vue'
import { ValidationError } from 'yup'

import { useMe, usesSettingsStatistics } from '@/hooks/auth-hooks.ts'
import { onboardingSchema } from '@/validations/onboarding.ts'
import { CURRENCIES } from '@/constants/currencies.ts'

import KitSettingsFieldWrapper from '@/components/kit/KitSettingsFieldWrapper.vue'
import KitDropdown from '@/components/kit/KitDropdown.vue'
import KitInput from '@/components/kit/KitInput.vue'
import KitButton from '@/components/kit/KitButton.vue'

const { me, refreshMe } = useMe()
const { settingsStatistics } = usesSettingsStatistics()

const currency = ref(me.value?.me.currency || '')
const monthStartDay = ref(me.value?.me.monthStartDay || '')
const monthlyBudget = ref(me.value?.me.monthlyBudget || '')

const errors = ref<Record<string, string>>({})

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

const update = async () => {
  console.log('update')
  try {
    const isValid = await validateForm()
    if (!isValid) return
    console.log('update.valid', currency.value, monthStartDay.value, monthlyBudget.value)

    const data = await settingsStatistics({
      currency: currency.value,
      monthStartDay: Number(monthStartDay.value),
      monthlyBudget: Number(monthlyBudget.value),
    })

    if (data) {
      refreshMe()
      console.log('settings.success', data)
      // toast.success($_('settings.success')) // TODO: add toast
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
      // toast.error($_('common_errors.server_error')) // TODO: add toast
    }
  }
}

const isChanged = computed(() => {
  return (
    currency.value !== me.value?.me.currency ||
    monthStartDay.value !== me.value?.me.monthStartDay ||
    monthlyBudget.value !== me.value?.me.monthlyBudget
  )
})
</script>

<template>
  <form @submit.prevent="update" class="form">
    <kit-settings-field-wrapper
      :label="$t('settings.fields.currency.label')"
      :description="$t('settings.fields.currency.description')"
      :error="Boolean(errors?.currency)"
      :message="errors?.currency ? $t(`settings.fields.currency.errors.${errors.currency}`) : ''"
    >
      <kit-dropdown
        :options="CURRENCIES"
        :placeholder="$t('settings.fields.currency.placeholder')"
        v-model="currency"
      />
    </kit-settings-field-wrapper>
    <kit-settings-field-wrapper
      :label="$t('settings.fields.monthStartDay.label')"
      :description="$t('settings.fields.monthStartDay.description')"
      :error="Boolean(errors?.monthStartDay)"
      :message="
        errors?.monthStartDay
          ? $t(`settings.fields.monthStartDay.errors.${errors.monthStartDay}`)
          : ''
      "
    >
      <kit-input
        v-model="monthStartDay"
        type="number"
        :placeholder="$t('settings.fields.monthStartDay.placeholder')"
        :error="Boolean(errors?.monthStartDay)"
      />
    </kit-settings-field-wrapper>
    <kit-settings-field-wrapper
      :label="$t('settings.fields.monthlyBudget.label')"
      :description="$t('settings.fields.monthlyBudget.description')"
      :error="Boolean(errors?.monthlyBudget)"
      :message="
        errors?.monthlyBudget
          ? $t(`settings.fields.monthlyBudget.errors.${errors.monthlyBudget}`)
          : ''
      "
    >
      <kit-input
        v-model="monthlyBudget"
        type="number"
        :placeholder="$t('settings.fields.monthlyBudget.placeholder')"
        :error="Boolean(errors?.monthlyBudget)"
      />
    </kit-settings-field-wrapper>
    <div class="buttons">
      <kit-button type="submit" :disabled="!isChanged">{{ $t('settings.submit') }}</kit-button>
    </div>
  </form>
</template>

<style scoped>
.form :deep(.texts),
.form :deep(.control) {
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
  .form :deep(.texts) {
    padding-inline: var(--spacing-2xl) 0;
  }
  .form :deep(.control) {
    padding-inline: 0 var(--spacing-2xl);
  }

  .buttons {
    padding: var(--spacing-2xl);
  }
}
</style>
