<script setup lang="ts">
import { computed, ref } from 'vue'
import { ValidationError } from 'yup'
import { useI18n } from 'vue-i18n'

import { useMe, usesSettingsGeneral } from '@/hooks/auth-hooks.ts'
import settingsGeneralSchema from '@/validations/settings.general.ts'
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
const { settingsGeneral, loading } = usesSettingsGeneral()
const { locale, availableLocales, t } = useI18n()

const name = ref(user.value?.name || '')
const email = ref(user.value?.email || '')
const lang = ref(user.value?.lang || '')
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
      if (data.lang === 'en' || data.lang === 'uk-UA') {
        locale.value = data.lang
      }
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

const passwordError = computed(() =>
  Boolean(errors.value.oldPassword || errors.value.newPassword || errors.value.confirmNewPassword),
)

const isChanged = computed(() => {
  return (
    name.value !== user.value?.name ||
    lang.value !== user.value?.lang ||
    newPassword.value !== '' ||
    confirmNewPassword.value !== '' ||
    oldPassword.value !== ''
  )
})
</script>

<template>
  <form @submit.prevent="update" class="flex flex-col px-4 md:px-6">
    <SettingsField
      :label="$t('settings.fields.lang.label')"
      :description="$t('settings.fields.lang.description')"
      :error="Boolean(errors?.lang)"
      :message="errors?.lang ? $t(`settings.fields.lang.errors.${errors.lang}`) : ''"
    >
      <Select v-model="lang">
        <SelectTrigger class="w-full" :aria-invalid="Boolean(errors?.lang)">
          <SelectValue :placeholder="getLangLabel(lang)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="loc in availableLocales" :key="loc" :value="loc">
            {{ getLangLabel(loc) }}
          </SelectItem>
        </SelectContent>
      </Select>
    </SettingsField>

    <SettingsField
      :label="$t('settings.fields.name.label')"
      :description="$t('settings.fields.name.description')"
      :error="Boolean(errors?.name)"
      :message="errors?.name ? $t(`settings.fields.name.errors.${errors.name}`) : ''"
    >
      <Input
        v-model="name"
        type="text"
        :placeholder="$t('settings.fields.name.placeholder')"
        :aria-invalid="Boolean(errors?.name)"
      />
    </SettingsField>

    <SettingsField
      :label="$t('settings.fields.email.label')"
      :description="$t('settings.fields.email.description')"
    >
      <Input v-model="email" type="email" disabled />
    </SettingsField>

    <SettingsField
      :label="$t('settings.fields.newPassword.label')"
      :description="$t('settings.fields.newPassword.description')"
      :error="passwordError"
      :message="passwordMessage"
    >
      <div class="flex flex-col gap-3">
        <Input
          v-model="newPassword"
          type="password"
          :placeholder="$t('settings.fields.newPassword.placeholder')"
          :aria-invalid="Boolean(errors?.newPassword)"
        />
        <Input
          v-model="confirmNewPassword"
          type="password"
          :placeholder="$t('settings.fields.confirmNewPassword.placeholder')"
          :aria-invalid="Boolean(errors?.confirmNewPassword)"
        />
        <Input
          v-model="oldPassword"
          type="password"
          :placeholder="$t('settings.fields.oldPassword.placeholder')"
          :aria-invalid="Boolean(errors?.oldPassword)"
        />
      </div>
    </SettingsField>

    <div class="flex justify-end border-t border-border py-5 md:py-6">
      <Button type="submit" :disabled="!isChanged || loading">
        {{ $t('settings.submit') }}
      </Button>
    </div>
  </form>
</template>
