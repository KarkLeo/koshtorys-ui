<script setup lang="ts">
import { ref } from 'vue'
import { ValidationError } from 'yup'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { registerSchema } from '@/validations/register.ts'
import { useSignUp } from '@/hooks/auth-hooks.ts'

import KitFieldWrapper from '@/components/kit/KitFieldWrapper.vue'
import KitInput from '@/components/kit/KitInput.vue'
import KitButton from '@/components/kit/KitButton.vue'
import { useToastStore } from '@/stores/toastStore.ts'

const { locale, t } = useI18n()
const { signUp } = useSignUp()
const router = useRouter()
const toastStore = useToastStore()

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
      toastStore.success(t('register.success'))
      await router.push('/login')
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
      toastStore.error(t('common_errors.server_error'))
    }
  }
}
</script>

<template>
  <div class="form-wrapper">
    <h1 class="title">{{ $t('register.title') }}</h1>
    <p class="description">
      {{ $t('register.description') }}
    </p>

    <form @submit.prevent="register" class="form">
      <kit-field-wrapper
        required
        :label="$t('register.fields.name.label')"
        :error="Boolean(errors?.name)"
        :message="errors?.name ? $t(`register.fields.name.errors.${errors.name}`) : ''"
      >
        <KitInput
          v-model="name"
          :placeholder="$t('register.fields.name.placeholder')"
          @blur="validateField('name')"
          :error="Boolean(errors?.name)"
          autocomplete="username"
        />
      </kit-field-wrapper>
      <kit-field-wrapper
        required
        :label="$t('register.fields.email.label')"
        :error="Boolean(errors?.email)"
        :message="errors?.email ? $t(`register.fields.email.errors.${errors.email}`) : ''"
      >
        <KitInput
          v-model="email"
          type="email"
          :placeholder="$t('register.fields.email.placeholder')"
          @blur="validateField('email')"
          :error="Boolean(errors?.email)"
          autocomplete="email"
        />
      </kit-field-wrapper>
      <kit-field-wrapper
        required
        :label="$t('register.fields.password.label')"
        :error="Boolean(errors?.password)"
        :message="errors?.password ? $t(`register.fields.password.errors.${errors.password}`) : ''"
      >
        <KitInput
          v-model="password"
          type="password"
          :placeholder="$t('register.fields.password.placeholder')"
          @blur="validateField('password')"
          :error="Boolean(errors?.password)"
          autocomplete="new-password"
        />
      </kit-field-wrapper>
      <kit-field-wrapper
        required
        :label="$t('register.fields.confirmPassword.label')"
        :error="Boolean(errors?.confirmPassword)"
        :message="
          errors?.confirmPassword
            ? $t(`register.fields.confirmPassword.errors.${errors.confirmPassword}`)
            : ''
        "
      >
        <KitInput
          v-model="confirmPassword"
          type="password"
          :placeholder="$t('register.fields.confirmPassword.placeholder')"
          @blur="validateField('confirmPassword')"
          :error="Boolean(errors?.confirmPassword)"
          autocomplete="new-password"
        />
      </kit-field-wrapper>

      <div class="buttons">
        <KitButton type="submit">{{ $t('register.submit') }}</KitButton>
      </div>
    </form>
    <p class="sub-form">
      {{ $t('register.sub_form.title') }}{{ ' ' }}
      <router-link to="/login" class="link"> {{ $t('register.sub_form.link') }} </router-link>
    </p>
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
