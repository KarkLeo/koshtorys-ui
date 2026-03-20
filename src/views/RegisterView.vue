g
<script setup lang="ts">
import { ref } from 'vue'
import { ValidationError } from 'yup'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { registerSchema } from '@/validations/register.ts'
import { useSignUp } from '@/hooks/auth-hooks.ts'
import { toast } from 'vue-sonner'
import { ApiError } from '@/api/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const { locale, t } = useI18n()
const { signUp, loading } = useSignUp()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const errors = ref<Record<string, string>>({})

const validateField = async (fieldName: string) => {
  try {
    await registerSchema.validateAt(
      fieldName,
      {
        name: name.value,
        email: email.value,
        password: password.value,
        confirmPassword: confirmPassword.value,
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
      [fieldName]: (validationErrors as ValidationError).errors[0],
    }
    return false
  }
}

const validateForm = async () => {
  try {
    await registerSchema.validate(
      {
        name: name.value,
        email: email.value,
        password: password.value,
        confirmPassword: confirmPassword.value,
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

const register = async () => {
  try {
    const isValid = await validateForm()
    if (!isValid) return

    const data = await signUp({
      name: name.value,
      email: email.value,
      password: password.value,
      lang: locale.value || 'en',
    })

    if (data) {
      toast.success(t('register.success'))
      await router.push('/login')
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
  <div class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-6 md:px-8">
    <h1 class="mb-3 text-3xl font-semibold text-foreground">{{ $t('register.title') }}</h1>
    <p class="mb-8 text-base text-muted-foreground">
      {{ $t('register.description') }}
    </p>

    <form @submit.prevent="register" class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <Label :class="{ 'text-destructive': Boolean(errors?.name) }">
          {{ $t('register.fields.name.label') }} <span class="text-destructive">*</span>
        </Label>
        <Input
          v-model="name"
          :placeholder="$t('register.fields.name.placeholder')"
          @blur="validateField('name')"
          :aria-invalid="Boolean(errors?.name)"
          autocomplete="username"
        />
        <p v-if="errors?.name" class="text-sm text-destructive">
          {{ $t(`register.fields.name.errors.${errors.name}`) }}
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <Label :class="{ 'text-destructive': Boolean(errors?.email) }">
          {{ $t('register.fields.email.label') }} <span class="text-destructive">*</span>
        </Label>
        <Input
          v-model="email"
          type="email"
          :placeholder="$t('register.fields.email.placeholder')"
          @blur="validateField('email')"
          :aria-invalid="Boolean(errors?.email)"
          autocomplete="email"
        />
        <p v-if="errors?.email" class="text-sm text-destructive">
          {{ $t(`register.fields.email.errors.${errors.email}`) }}
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <Label :class="{ 'text-destructive': Boolean(errors?.password) }">
          {{ $t('register.fields.password.label') }} <span class="text-destructive">*</span>
        </Label>
        <Input
          v-model="password"
          type="password"
          :placeholder="$t('register.fields.password.placeholder')"
          @blur="validateField('password')"
          :aria-invalid="Boolean(errors?.password)"
          autocomplete="new-password"
        />
        <p v-if="errors?.password" class="text-sm text-destructive">
          {{ $t(`register.fields.password.errors.${errors.password}`) }}
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <Label :class="{ 'text-destructive': Boolean(errors?.confirmPassword) }">
          {{ $t('register.fields.confirmPassword.label') }} <span class="text-destructive">*</span>
        </Label>
        <Input
          v-model="confirmPassword"
          type="password"
          :placeholder="$t('register.fields.confirmPassword.placeholder')"
          @blur="validateField('confirmPassword')"
          :aria-invalid="Boolean(errors?.confirmPassword)"
          autocomplete="new-password"
        />
        <p v-if="errors?.confirmPassword" class="text-sm text-destructive">
          {{ $t(`register.fields.confirmPassword.errors.${errors.confirmPassword}`) }}
        </p>
      </div>

      <div class="mt-2 flex flex-col">
        <Button type="submit" class="w-full" :disabled="loading">{{ $t('register.submit') }}</Button>
      </div>
    </form>

    <p class="mt-8 text-center text-sm text-muted-foreground">
      {{ $t('register.sub_form.title') }}{{ ' ' }}
      <router-link to="/login" class="font-medium text-primary underline-offset-4 hover:underline">
        {{ $t('register.sub_form.link') }}
      </router-link>
    </p>
  </div>
</template>
