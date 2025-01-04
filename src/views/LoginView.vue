<script setup lang="ts">
import { ref } from 'vue'
import { ValidationError } from 'yup'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { loginSchema } from '@/validations/login.ts'
import { useMe, useSignIn } from '@/hooks/auth-hooks.ts'

import KitFieldWrapper from '@/components/kit/KitFieldWrapper.vue'
import KitInput from '@/components/kit/KitInput.vue'
import KitButton from '@/components/kit/KitButton.vue'
import { useToastStore } from '@/stores/toastStore.ts'

const { signIn } = useSignIn()
const { refreshMe } = useMe()
const { locale, t } = useI18n()
const router = useRouter()
const toastStore = useToastStore()

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
      refreshMe()
      toastStore.success(t('login.success'))
      await router.push('/dashboard')
    }
    // eslint-disable-next-line
  } catch (e: any) {
    try {
      const errorCodes = e.cause.extensions.originalError.errorCodes
      if (errorCodes) {
        errors.value = errorCodes
        if (errorCodes.form) {
          toastStore.error(t(`login.errors.${errorCodes.form}`))
        }
      }
      // eslint-disable-next-line
    } catch (e: any) {
      toastStore.error(t('common_errors.server_error'))
    }
  }
}
</script>

<template>
  <div class="form-wrapper">
    <h1 class="title">{{ $t('login.title') }}</h1>
    <p class="description">
      {{ $t('login.description') }}
    </p>

    <form @submit.prevent="login" class="form">
      <kit-field-wrapper
        required
        :label="$t('login.fields.email.label')"
        :error="Boolean(errors?.email)"
        :message="errors?.email ? $t(`login.fields.email.errors.${errors.email}`) : ''"
      >
        <kit-input
          v-model="email"
          type="email"
          :placeholder="$t('login.fields.email.placeholder')"
          @blur="validateField('email')"
          :error="Boolean(errors?.email)"
          autocomplete="email"
        />
      </kit-field-wrapper>
      <kit-field-wrapper
        required
        :label="$t('login.fields.password.label')"
        :error="Boolean(errors?.password)"
        :message="errors?.password ? $t(`login.fields.password.errors.${errors.password}`) : ''"
      >
        <kit-input
          v-model="password"
          type="password"
          :placeholder="$t('login.fields.password.placeholder')"
          @blur="validateField('password')"
          :error="Boolean(errors?.password)"
          autocomplete="current-password"
        />
      </kit-field-wrapper>
      <div class="buttons">
        <kit-button type="submit">{{ $t('login.submit') }}</kit-button>
      </div>
      <p class="sub-form">
        {{ $t('login.sub_form.title') }}{{ ' ' }}
        <router-link to="/register" class="link"> {{ $t('login.sub_form.link') }} </router-link>
      </p>
    </form>
  </div>
</template>

<style scoped>
.form-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: calc(var(--width-xs) + 2 * var(--spacing-xl));
  width: 100%;
  margin: 0 auto;
  flex-grow: 1;
  padding: var(--spacing-xl);
  box-sizing: border-box;
}

.title {
  margin: 0 0 var(--spacing-lg);

  font-size: var(--font-size-display-sm);
  line-height: var(--line-height-display-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.description {
  margin: 0 0 var(--spacing-4xl);

  font-size: var(--font-size-text-md);
  line-height: var(--line-height-text-md);
  font-weight: var(--font-weight-regular);
  color: var(--text-tertiary);
}
.form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.buttons {
  margin-top: var(--spacing-xs);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.sub-form {
  margin: var(--spacing-4xl) 0 0;

  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-regular);
  color: var(--text-tertiary);
  text-align: center;
}
.sub-form a {
  color: var(--fg-brand-primary_alt);
  text-decoration: none;
}

@media screen and (min-width: 768px) {
  .form-wrapper {
    max-width: calc(var(--width-xs) + 2 * var(--spacing-4xl));
    padding: var(--spacing-4xl);
  }
}
</style>
