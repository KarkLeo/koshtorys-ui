<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ValidationError } from 'yup'

import { nowDateUTC } from '@/helpers/date.ts'
import { CURRENCIES } from '@/constants/currencies.ts'
import { useToastStore } from '@/stores/toastStore.ts'
import { useMe } from '@/hooks/auth-hooks.ts'
import { useCreateTransaction } from '@/hooks/transaction-hooks.ts'
import { transactionSchema } from '@/validations/transaction.ts'

import KitMoneyInput from '@/components/kit/KitMoneyInput.vue'
import KitInput from '@/components/kit/KitInput.vue'
import KitButton from '@/components/kit/KitButton.vue'
import KitDatePicker from '@/components/kit/KitDatePicker.vue'
import KitCategories from '@/components/kit/KitCategories.vue'
import KitSimpleFieldWrapper from '@/components/kit/KitSimpleFieldWrapper.vue'
import SelectPlanningModal from '@/components/transaction/SelectPlanningModal.vue'
import KitIconButton from '@/components/kit/KitIconButton.vue'
import IconLink from '@/components/icons/IconLink.vue'
import type { Planning } from '@/graphql/types.ts'
import KitPreloader from '@/components/kit/KitPreloader.vue'

// ===== Hooks =====

const { me } = useMe()
const toastStore = useToastStore()
const { createTransaction, loading } = useCreateTransaction()
const { t } = useI18n()

// ===== Refs =====

const formRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const errors = ref<Record<string, string>>({})

const amount = ref('')
const currency = ref(me.value?.me.currency || CURRENCIES[0])
const description = ref('')
const date = ref<Date>(nowDateUTC())
const categoryId = ref<string>('')

const selectPlanningModal = ref<HTMLElement | null>(null)
const selectedPlanning = ref<string | null>(null)
const isOpenSelectPlanningModal = ref(false)

// ===== Handlers ans utils =====

const validateForm = async () => {
  try {
    await transactionSchema.validate(
      {
        amount: parseFloat(amount.value || '0'),
        currency: currency.value,
        description: description.value,
        categoryId: categoryId.value,
        date: date.value.toISOString(),
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

const clearForm = () => {
  amount.value = ''
  description.value = ''
  categoryId.value = ''
  date.value = nowDateUTC()
  currency.value = me.value?.me.currency || CURRENCIES[0]
  isOpen.value = false
  errors.value = {}
  isOpenSelectPlanningModal.value = false
  selectedPlanning.value = null
}

const handlerCreateTransaction = async () => {
  try {
    const isValid = await validateForm()
    if (!isValid) return

    await createTransaction({
      transactionData: {
        amount: parseFloat(amount.value),
        currency: currency.value,
        description: description.value,
        categoryId: categoryId.value,
        date: date.value.toISOString(),
        planningId: selectedPlanning.value ? Number(selectedPlanning.value) : undefined,
      },
    })

    clearForm()
    toastStore.success(t('transaction.form.messages.add_success'))
    // eslint-disable-next-line
  } catch (e: any) {
    try {
      const errorCodes = e.cause.extensions.originalError.errorCodes
      if (errorCodes) {
        errors.value = errorCodes
      }
      if (errorCodes.form) {
        toastStore.error(t(`transaction.form.errors.${errorCodes.form}`))
      }
      // eslint-disable-next-line
    } catch (e: any) {
      toastStore.error(t('common_errors.server_error'))
    }
  }
}

const openSelectPlanningModal = () => {
  isOpenSelectPlanningModal.value = true
}

const closeSelectPlanningModal = () => {
  isOpenSelectPlanningModal.value = false
}

const submitSelectPlanningModal = (planning?: Planning) => {
  if (amount.value === '' && description.value === '') {
    amount.value = String(planning?.amount || 0)
    currency.value = planning?.currency || me.value?.me.currency || CURRENCIES[0]
    description.value = planning?.description || ''
    categoryId.value = planning?.categoryId || ''
    date.value = planning?.date ? new Date(planning.date) : nowDateUTC()
  }

  closeSelectPlanningModal()
}
</script>

<template>
  <div :class="['add-transaction-form', { active: isOpen }]" ref="formRef" @click="isOpen = true">
    <div :class="['add-transaction-form-preloader', { loading: loading }]">
      <KitPreloader size="md" />
    </div>
    <KitSimpleFieldWrapper
      :error="Boolean(errors?.amount)"
      :message="errors?.amount ? $t(`transaction.form.errors.${errors.amount}`) : ''"
    >
      <KitMoneyInput
        v-model="amount"
        v-model:currency="currency"
        :placeholder="$t('transaction.form.fields.amount.placeholder') + ': 0.00'"
        :min="0"
        :error="Boolean(errors?.amount)"
      />
    </KitSimpleFieldWrapper>
    <div class="form-fields-row-elastic">
      <KitSimpleFieldWrapper
        :error="Boolean(errors?.description)"
        :message="errors?.description ? $t(`transaction.form.errors.${errors.description}`) : ''"
      >
        <KitInput
          v-model="description"
          type="text"
          :placeholder="$t('transaction.form.fields.description.placeholder')"
          :error="Boolean(errors?.description)"
        />
      </KitSimpleFieldWrapper>
      <KitIconButton @click="openSelectPlanningModal" size="md">
        <IconLink :class="{ 'active-planning': Boolean(selectedPlanning) }" />
      </KitIconButton>
    </div>
    <div class="form-fields-row">
      <KitSimpleFieldWrapper
        :error="Boolean(errors?.date)"
        :message="errors?.date ? $t(`transaction.form.errors.${errors.date}`) : ''"
      >
        <KitDatePicker
          v-model="date"
          full-width
          :max-date="nowDateUTC()"
          :error="Boolean(errors?.date)"
        />
      </KitSimpleFieldWrapper>
      <KitSimpleFieldWrapper
        :error="Boolean(errors?.categoryId)"
        :message="errors?.categoryId ? $t(`transaction.form.errors.${errors.categoryId}`) : ''"
      >
        <KitCategories v-model="categoryId" :error="Boolean(errors?.categoryId)" />
      </KitSimpleFieldWrapper>
    </div>
    <KitButton size="xl" @click="handlerCreateTransaction">
      {{ $t('transaction.form.buttons.add') }}
    </KitButton>
  </div>
  <div class="add-transaction-form-overlay" @click="clearForm" />
  <SelectPlanningModal
    @click.stop
    ref="selectPlanningModal"
    v-if="isOpenSelectPlanningModal"
    v-model="selectedPlanning"
    @close="closeSelectPlanningModal"
    @submit="submitSelectPlanningModal"
  />
</template>

<style scoped>
.add-transaction-form {
  position: fixed;
  left: 50%;
  bottom: 0;
  z-index: 999;

  max-width: 640px;
  width: calc(100% - var(--spacing-xl) * 2);
  padding: var(--spacing-3xl);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);

  border: 1px solid var(--border-brand);
  background-color: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow:
    0 2px 2px -1px #0a0d120a,
    0 4px 6px -2px #0a0d1208,
    0 12px 16px -4px #0a0d1214;

  transform: translateY(calc(100% - 84px)) translateX(-50%);
  transition: all 0.5s ease-in-out;
}

.active {
  transform: translateY(calc(-1 * var(--spacing-xl))) translateX(-50%);

  border-color: var(--border-primary);
  box-shadow:
    0 0 0 2px var(--bg-primary),
    0 0 0 4px var(--border-brand),
    0 2px 2px -1px #0a0d120a,
    0 4px 6px -2px #0a0d1208,
    0 12px 16px -4px #0a0d1214;
}

.add-transaction-form-preloader {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;

  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: #0c111dcc;
  backdrop-filter: blur(2px);
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease-in-out;
}

.loading {
  opacity: 1;
  pointer-events: auto;
}

.add-transaction-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;

  backdrop-filter: blur(4px);
  background-color: rgba(0, 0, 0, 0.1);
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease-in-out;
}

.active + .add-transaction-form-overlay {
  opacity: 1;
  pointer-events: auto;
}

.form-fields-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
}

.form-fields-row-elastic {
  display: grid;
  grid-template-columns: 1fr min-content;
  gap: var(--spacing-xl);
}

.active-planning {
  color: var(--fg-brand-primary) !important;
}

@media screen and (min-width: 768px) {
  .form-fields-row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
