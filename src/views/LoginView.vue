<script setup lang="ts">
import { ref } from 'vue'
import { ValidationError } from 'yup'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { loginSchema } from '@/validations/login.ts'
import { useSignIn } from '@/hooks/auth-hooks.ts'
import { toast } from 'vue-sonner'
import { ApiError } from '@/api/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const { signIn } = useSignIn()
const { locale, t } = useI18n()
const router = useRouter()

const email = ref('')
const password = ref('')

const errors = ref<Record<string, string>>({})

const validateField = (fieldName: string) => async () => {
  try {
    await loginSchema.validateAt(fieldName, { email, password }, { abortEarly: false })
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
    await loginSchema.validate(
      { email: email.value, password: password.value },
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

const login = async () => {
  try {
    const isValid = await validateForm()
    if (!isValid) return

    const data = await signIn({ email: email.value, password: password.value })
    if (data) {
      locale.value = data?.user?.lang || 'en'
      toast.success(t('login.success'))
      await router.push('/dashboard')
    }
    // eslint-disable-next-line
  } catch (e: any) {
    if (e instanceof ApiError && e.errorCodes) {
      errors.value = e.errorCodes
      if (e.errorCodes.form) {
        toast.error(t(`login.errors.${e.errorCodes.form}`))
      }
    } else {
      toast.error(t('common_errors.server_error'))
    }
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-6 md:px-8">
    <h1 class="mb-3 text-3xl font-semibold text-foreground">{{ $t('login.title') }}</h1>
    <p class="mb-8 text-base text-muted-foreground">
      {{ $t('login.description') }}
    </p>

    <form @submit.prevent="login" class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <Label :class="{ 'text-destructive': Boolean(errors?.email) }">
          {{ $t('login.fields.email.label') }} <span class="text-destructive">*</span>
        </Label>
        <Input
          v-model="email"
          type="email"
          :placeholder="$t('login.fields.email.placeholder')"
          @blur="validateField('email')"
          :aria-invalid="Boolean(errors?.email)"
          autocomplete="email"
        />
        <p v-if="errors?.email" class="text-sm text-destructive">
          {{ $t(`login.fields.email.errors.${errors.email}`) }}
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <Label :class="{ 'text-destructive': Boolean(errors?.password) }">
          {{ $t('login.fields.password.label') }} <span class="text-destructive">*</span>
        </Label>
        <Input
          v-model="password"
          type="password"
          :placeholder="$t('login.fields.password.placeholder')"
          @blur="validateField('password')"
          :aria-invalid="Boolean(errors?.password)"
          autocomplete="current-password"
        />
        <p v-if="errors?.password" class="text-sm text-destructive">
          {{ $t(`login.fields.password.errors.${errors.password}`) }}
        </p>
      </div>

      <div class="mt-2 flex flex-col">
        <Button type="submit" class="w-full">{{ $t('login.submit') }}</Button>
      </div>

      <p class="mt-6 text-center text-sm text-muted-foreground">
        {{ $t('login.sub_form.title') }}{{ ' ' }}
        <router-link to="/register" class="font-medium text-primary underline-offset-4 hover:underline">
          {{ $t('login.sub_form.link') }}
        </router-link>
      </p>
    </form>
  </div>
</template>
