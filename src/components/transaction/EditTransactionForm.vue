<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ValidationError } from 'yup'

import type { TransactionsQuery } from '@/graphql/types.ts'
import { CURRENCIES } from '@/constants/currencies.ts'
import { toast } from 'vue-sonner'
import { useMe } from '@/hooks/auth-hooks.ts'
import { useUpdateTransaction } from '@/hooks/transaction-hooks.ts'
import { transactionSchema } from '@/validations/transaction.ts'

import KitMoneyInput from '@/components/kit/KitMoneyInput.vue'
import KitInput from '@/components/kit/KitInput.vue'
import KitButton from '@/components/kit/KitButton.vue'
import KitDatePicker from '@/components/kit/KitDatePicker.vue'
import KitCategories from '@/components/kit/KitCategories.vue'
import KitSimpleFieldWrapper from '@/components/kit/KitSimpleFieldWrapper.vue'
import KitIconButton from '@/components/kit/KitIconButton.vue'
import IconLink from '@/components/icons/IconLink.vue'
import SelectPlanningModal from '@/components/transaction/SelectPlanningModal.vue'
import KitPreloader from '@/components/kit/KitPreloader.vue'

// ===== Types =====

type BaseTransaction = TransactionsQuery['transactions'][number]

interface ExtendedTransaction extends BaseTransaction {
  originalAmount?: number
  originalCurrency?: string
}

// ===== Emits and Props =====

const emit = defineEmits(['closeForm'])
const { transaction } = defineProps<{
  transaction: ExtendedTransaction
}>()

// ===== Hooks =====

const { t } = useI18n()
const { user } = useMe()
const { updateTransaction, loading } = useUpdateTransaction()

// ===== Refs =====

const formRef = ref<HTMLElement | null>(null)
const errors = ref<Record<string, string>>({})

const amount = ref(String(transaction?.originalAmount || transaction.amount))
const currency = ref(
  transaction?.originalCurrency || transaction.currency || user.value?.currency || CURRENCIES[0],
)
const description = ref(transaction?.description || '')
const date = ref<Date>(new Date(transaction.date))
const categoryId = ref<string>(transaction?.categoryId || '')

const selectPlanningModal = ref<HTMLElement | null>(null)
const selectedPlanning = ref<string | null>(
  transaction.planningId ? String(transaction.planningId) : null,
)
const isOpenSelectPlanningModal = ref(false)

// ===== Watchers =====

watch(
  () => transaction,
  (newTransaction) => {
    amount.value = String(newTransaction?.originalAmount || newTransaction.amount)
    currency.value =
      newTransaction?.originalCurrency ||
      newTransaction.currency ||
      user.value?.currency ||
      CURRENCIES[0]
    description.value = newTransaction?.description || ''
    date.value = new Date(newTransaction.date)
    categoryId.value = newTransaction?.categoryId || ''
    selectedPlanning.value = newTransaction?.planningId ? String(newTransaction.planningId) : null
  },
)

// ===== Handlers and utils =====

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
  date.value = new Date()
  currency.value = user.value?.currency || CURRENCIES[0]
  errors.value = {}
  isOpenSelectPlanningModal.value = false
  selectedPlanning.value = null
}

const handlerUpdateTransaction = async () => {
  try {
    const isValid = await validateForm()
    if (!isValid) return

    await updateTransaction({
      transactionData: {
        amount: parseFloat(amount.value),
        currency: currency.value,
        description: description.value,
        categoryId: categoryId.value,
        date: date.value.toISOString(),
        planningId: selectedPlanning.value ? Number(selectedPlanning.value) : undefined,
      },
      transactionId: Number(transaction.id),
    })

    clearForm()
    emit('closeForm')
    toast.success(t('transaction.form.messages.update_success'))
    // eslint-disable-next-line
  } catch (e: any) {
    try {
      const errorCodes = e.cause.extensions.originalError.errorCodes
      if (errorCodes) {
        errors.value = errorCodes
      }

      if (errorCodes.form) {
        toast.error(t(`transaction.form.errors.${errorCodes.form}`))
      }
      // eslint-disable-next-line
    } catch (e: any) {
      toast.error(t('common_errors.server_error'))
    }
  }
}

const handleCloseForm = () => {
  clearForm()
  emit('closeForm')
}

const openSelectPlanningModal = () => {
  isOpenSelectPlanningModal.value = true
}

const closeSelectPlanningModal = () => {
  isOpenSelectPlanningModal.value = false
}

const submitSelectPlanningModal = () => {
  closeSelectPlanningModal()
}
</script>

<template>
  <div class="edit-transaction-form" ref="formRef">
    <div :class="['edit-transaction-form-preloader', { loading: loading }]">
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
          @click.stop
          :max-date="new Date()"
          :error="Boolean(errors?.date)"
        />
      </KitSimpleFieldWrapper>
      <KitSimpleFieldWrapper
        :error="Boolean(errors?.categoryId)"
        :message="errors?.categoryId ? $t(`transaction.form.errors.${errors.categoryId}`) : ''"
      >
        <KitCategories v-model="categoryId" @click.stop :error="Boolean(errors?.categoryId)" />
      </KitSimpleFieldWrapper>
    </div>
    <div class="form-buttons-row">
      <KitButton size="lg" @click="handlerUpdateTransaction">
        {{ $t('transaction.form.buttons.update') }}
      </KitButton>
      <KitButton size="lg" variant="secondary-gray" @click="handleCloseForm">
        {{ $t('transaction.form.buttons.cancel') }}
      </KitButton>
    </div>
  </div>
  <SelectPlanningModal
    @click.stop
    :old-planning-id="transaction.planningId ? String(transaction.planningId) : null"
    ref="selectPlanningModal"
    v-if="isOpenSelectPlanningModal"
    v-model="selectedPlanning"
    @close="closeSelectPlanningModal"
    @submit="submitSelectPlanningModal"
  />
</template>

<style scoped>
.edit-transaction-form {
  position: relative;

  width: 100%;
  padding: var(--spacing-3xl);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);

  background-color: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-xl);
}

.edit-transaction-form-preloader {
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

.form-buttons-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
}

@media screen and (min-width: 768px) {
  .form-fields-row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
