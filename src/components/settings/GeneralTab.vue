<script setup lang="ts">
import { computed, ref } from 'vue'
import { ValidationError } from 'yup'
import { useI18n } from 'vue-i18n'

import { useMe, usesSettingsGeneral } from '@/hooks/auth-hooks.ts'
import settingsGeneralSchema from '@/validations/settings.general.ts'
import KitSettingsFieldWrapper from '@/components/kit/KitSettingsFieldWrapper.vue'
import KitDropdown from '@/components/kit/KitDropdown.vue'
import KitInput from '@/components/kit/KitInput.vue'
import KitButton from '@/components/kit/KitButton.vue'
import { useToastStore } from '@/stores/toastStore.ts'

const { me, refreshMe } = useMe()
const { settingsGeneral } = usesSettingsGeneral()
const { locale, availableLocales, t } = useI18n()
const toastStore = useToastStore()

const name = ref(me.value?.me.name || '')
const email = ref(me.value?.me.email || '')
const lang = ref(me.value?.me.lang || '')
const newPassword = ref('')
const confirmNewPassword = ref('')
const oldPassword = ref('')

const errors = ref<Record<string, string>>({})

const getLangLabel = (locale: string) => {
  switch (locale) {
    case 'en':
      return 'English'
    case 'uk-UA':
      return 'Українська'
    default:
      return locale
  }
}

const validateForm = async () => {
  try {
    await settingsGeneralSchema.validate(
      {
        name: name.value,
        newPassword: newPassword.value,
        confirmNewPassword: confirmNewPassword.value,
        oldPassword: oldPassword.value,
        lang: lang.value,
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

    const data = await settingsGeneral({
      name: name.value,
      lang: lang.value,
      newPassword: newPassword.value,
      oldPassword: oldPassword.value,
    })

    if (data) {
      refreshMe()
      if (data.lang === 'en' || data.lang === 'uk-UA') {
        locale.value = data.lang
      }
      toastStore.success(t('settings.success'))
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

const passwordMessage = computed(() => {
  if (errors.value.oldPassword) {
    return errors.value.oldPassword
  }
  if (errors.value.newPassword) {
    return errors.value.newPassword
  }
  if (errors.value.confirmNewPassword) {
    return errors.value.confirmNewPassword
  }
  return ''
})

const isChanged = computed(() => {
  return (
    name.value !== me.value?.me.name ||
    lang.value !== me.value?.me.lang ||
    newPassword.value !== '' ||
    confirmNewPassword.value !== '' ||
    oldPassword.value !== ''
  )
})
</script>

<template>
  <form @submit.prevent="update" class="form">
    <KitSettingsFieldWrapper
      :label="$t('settings.fields.lang.label')"
      :description="$t('settings.fields.lang.description')"
      :error="Boolean(errors?.lang)"
      :message="errors?.lang ? $t(`settings.fields.lang.errors.${errors?.lang}`) : ''"
    >
      <KitDropdown v-model="lang" :options="availableLocales" :getOptionLabel="getLangLabel" />
    </KitSettingsFieldWrapper>
    <KitSettingsFieldWrapper
      :label="$t('settings.fields.name.label')"
      :description="$t('settings.fields.name.description')"
      :error="Boolean(errors?.name)"
      :message="errors?.name ? $t(`settings.fields.name.errors.${errors?.name}`) : ''"
    >
      <KitInput
        v-model="name"
        type="text"
        :placeholder="$t('settings.fields.name.placeholder')"
        :error="Boolean(errors?.name)"
      />
    </KitSettingsFieldWrapper>
    <KitSettingsFieldWrapper
      :label="$t('settings.fields.email.label')"
      :description="$t('settings.fields.email.description')"
    >
      <KitInput v-model="email" type="email" disabled />
    </KitSettingsFieldWrapper>
    <KitSettingsFieldWrapper
      :label="$t('settings.fields.newPassword.label')"
      :description="$t('settings.fields.newPassword.description')"
      :error="Boolean(errors?.newPassword || errors?.confirmNewPassword || errors?.oldPassword)"
      :message="passwordMessage"
    >
      <div class="inputs">
        <KitInput
          v-model="newPassword"
          type="password"
          :placeholder="$t('settings.fields.newPassword.placeholder')"
          :error="Boolean(errors?.newPassword)"
        />
        <KitInput
          v-model="confirmNewPassword"
          type="password"
          :placeholder="$t('settings.fields.confirmNewPassword.placeholder')"
          :error="Boolean(errors?.confirmNewPassword)"
        />
        <KitInput
          v-model="oldPassword"
          type="password"
          :placeholder="$t('settings.fields.oldPassword.placeholder')"
          :error="Boolean(errors?.oldPassword)"
        />
      </div>
    </KitSettingsFieldWrapper>
    <div class="buttons">
      <KitButton type="submit" :disabled="!isChanged">{{ $t('settings.submit') }}</KitButton>
    </div>
  </form>
</template>

<style scoped>
.form :deep(.texts),
.form :deep(.control) {
  padding-inline: var(--spacing-2xl);
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
