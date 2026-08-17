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

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const { onboarding, loading } = usesOnboarding()
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
  <div class="flex flex-1 flex-col items-center justify-center p-6 md:p-12">
    <Card class="w-full max-w-2xl">
      <CardHeader>
        <CardTitle class="text-2xl font-semibold md:text-3xl">
          {{ $t('onboarding.title') }}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleOnboarding" class="flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <Label :class="{ 'text-destructive': Boolean(errors?.currency) }">
              {{ $t('onboarding.fields.currency.label') }}
            </Label>
            <p class="text-sm text-muted-foreground">
              {{ $t('onboarding.fields.currency.description') }}
            </p>
            <Select
              :model-value="currency"
              @update:model-value="(value) => (currency = value as (typeof CURRENCIES)[number])"
            >
              <SelectTrigger :aria-invalid="Boolean(errors?.currency)">
                <SelectValue :placeholder="$t('onboarding.fields.currency.placeholder')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in CURRENCIES" :key="option" :value="option">
                  {{ option }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors?.currency" class="text-sm text-destructive">
              {{ $t(`onboarding.fields.currency.errors.${errors.currency}`) }}
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <Label :class="{ 'text-destructive': Boolean(errors?.monthStartDay) }">
              {{ $t('onboarding.fields.monthStartDay.label') }}
            </Label>
            <p class="text-sm text-muted-foreground">
              {{ $t('onboarding.fields.monthStartDay.description') }}
            </p>
            <Input
              v-model="monthStartDay"
              type="number"
              :placeholder="$t('onboarding.fields.monthStartDay.placeholder')"
              @blur="validateField('monthStartDay')"
              :aria-invalid="Boolean(errors?.monthStartDay)"
            />
            <p v-if="errors?.monthStartDay" class="text-sm text-destructive">
              {{ $t(`onboarding.fields.monthStartDay.errors.${errors.monthStartDay}`) }}
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <Label :class="{ 'text-destructive': Boolean(errors?.monthlyBudget) }">
              {{ $t('onboarding.fields.monthlyBudget.label') }}
            </Label>
            <p class="text-sm text-muted-foreground">
              {{ $t('onboarding.fields.monthlyBudget.description') }}
            </p>
            <Input
              v-model="monthlyBudget"
              type="number"
              :placeholder="$t('onboarding.fields.monthlyBudget.placeholder')"
              @blur="validateField('monthlyBudget')"
              :aria-invalid="Boolean(errors?.monthlyBudget)"
            />
            <p v-if="errors?.monthlyBudget" class="text-sm text-destructive">
              {{ $t(`onboarding.fields.monthlyBudget.errors.${errors.monthlyBudget}`) }}
            </p>
          </div>

          <div class="flex justify-end border-t pt-6">
            <Button type="submit" :disabled="loading">
              {{ $t('onboarding.submit') }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
