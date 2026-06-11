<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ValidationError } from 'yup'

import { useMe, usesSettingsStatistics } from '@/hooks/auth-hooks.ts'
import { onboardingSchema } from '@/validations/onboarding.ts'
import { CURRENCIES } from '@/constants/currencies.ts'
import { toast } from 'vue-sonner'
import { ApiError } from '@/api/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import SettingsField from '@/components/settings/SettingsField.vue'

const { user } = useMe()
const { settingsStatistics, loading } = usesSettingsStatistics()
const { t } = useI18n()

const currency = ref(user.value?.currency || '')
const monthStartDay = ref(user.value?.monthStartDay ?? '')
const monthlyBudget = ref(user.value?.monthlyBudget ?? '')

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
  try {
    const isValid = await validateForm()
    if (!isValid) return

    const data = await settingsStatistics({
      currency: currency.value,
      monthStartDay: Number(monthStartDay.value),
      monthlyBudget: Number(monthlyBudget.value),
    })

    if (data) {
      toast.success(t('settings.success'))
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

const isChanged = computed(() => {
  return (
    currency.value !== user.value?.currency ||
    Number(monthStartDay.value) !== user.value?.monthStartDay ||
    Number(monthlyBudget.value) !== user.value?.monthlyBudget
  )
})
</script>

<template>
  <form @submit.prevent="update" class="flex flex-col px-4 md:px-6">
    <SettingsField
      :label="$t('settings.fields.currency.label')"
      :description="$t('settings.fields.currency.description')"
      :error="Boolean(errors?.currency)"
      :message="errors?.currency ? $t(`settings.fields.currency.errors.${errors.currency}`) : ''"
    >
      <Select v-model="currency">
        <SelectTrigger class="w-full" :aria-invalid="Boolean(errors?.currency)">
          <SelectValue :placeholder="$t('settings.fields.currency.placeholder')" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="option in CURRENCIES" :key="option" :value="option">
            {{ option }}
          </SelectItem>
        </SelectContent>
      </Select>
    </SettingsField>

    <SettingsField
      :label="$t('settings.fields.monthStartDay.label')"
      :description="$t('settings.fields.monthStartDay.description')"
      :error="Boolean(errors?.monthStartDay)"
      :message="
        errors?.monthStartDay ? $t(`settings.fields.monthStartDay.errors.${errors.monthStartDay}`) : ''
      "
    >
      <Input
        v-model="monthStartDay"
        type="number"
        :placeholder="$t('settings.fields.monthStartDay.placeholder')"
        :aria-invalid="Boolean(errors?.monthStartDay)"
      />
    </SettingsField>

    <SettingsField
      :label="$t('settings.fields.monthlyBudget.label')"
      :description="$t('settings.fields.monthlyBudget.description')"
      :error="Boolean(errors?.monthlyBudget)"
      :message="
        errors?.monthlyBudget ? $t(`settings.fields.monthlyBudget.errors.${errors.monthlyBudget}`) : ''
      "
    >
      <Input
        v-model="monthlyBudget"
        type="number"
        :placeholder="$t('settings.fields.monthlyBudget.placeholder')"
        :aria-invalid="Boolean(errors?.monthlyBudget)"
      />
    </SettingsField>

    <div class="flex justify-end border-t border-border py-5 md:py-6">
      <Button type="submit" :disabled="!isChanged || loading">
        {{ $t('settings.submit') }}
      </Button>
    </div>
  </form>
</template>
