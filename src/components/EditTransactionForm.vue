<script setup lang="ts">
import { ref, watch } from 'vue'

import { useMe } from '@/hooks/auth-hooks.ts'
import { CURRENCIES } from '@/constants/currencies.ts'

import KitMoneyInput from '@/components/kit/KitMoneyInput.vue'
import KitInput from '@/components/kit/KitInput.vue'
import KitButton from '@/components/kit/KitButton.vue'
import KitDatePicker from '@/components/kit/KitDatePicker.vue'
import KitCategories from '@/components/kit/KitCategories.vue'
import KitSimpleFieldWrapper from '@/components/kit/KitSimpleFieldWrapper.vue'

import { useUpdateTransaction } from '@/hooks/transaction-hooks.ts'
import { nowDateUTC } from '@/helpers/time.ts'
import type { TransactionsQuery } from '@/graphql/types.ts'
import { useI18n } from 'vue-i18n'
import { transactionSchema } from '@/validations/transaction.ts'
import { ValidationError } from 'yup'
import { useToastStore } from '@/stores/toastStore.ts'

type BaseTransaction = TransactionsQuery['transactions'][number]

interface ExtendedTransaction extends BaseTransaction {
  originalAmount?: number
  originalCurrency?: string
}
const emit = defineEmits(['closeForm'])
const { transaction } = defineProps<{
  transaction: ExtendedTransaction
}>()

const { me } = useMe()
const toastStore = useToastStore()
const { updateTransaction } = useUpdateTransaction()
const { t } = useI18n()

const formRef = ref<HTMLElement | null>(null)
const errors = ref<Record<string, string>>({})

const amount = ref(String(transaction?.originalAmount || transaction.amount))
const currency = ref(
  transaction?.originalCurrency || transaction.currency || me.value?.me.currency || CURRENCIES[0],
)
const description = ref(transaction?.description || '')
const date = ref<Date>(new Date(transaction.date))
const categoryId = ref<string>(transaction?.categoryId || '')

watch(
  () => transaction,
  (newTransaction) => {
    amount.value = String(newTransaction?.originalAmount || newTransaction.amount)
    currency.value =
      newTransaction?.originalCurrency ||
      newTransaction.currency ||
      me.value?.me.currency ||
      CURRENCIES[0]
    description.value = newTransaction?.description || ''
    date.value = new Date(newTransaction.date)
    categoryId.value = newTransaction?.categoryId || ''
  },
)

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
  errors.value = {}
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
      },
      transactionId: Number(transaction.id),
    })

    clearForm()
    emit('closeForm')
    // eslint-disable-next-line
  } catch (e: any) {
    toastStore.error(t('common_errors.server_error'))
  }
}

const handleCloseForm = () => {
  clearForm()
  emit('closeForm')
}
</script>

<template>
  <div class="edit-transaction-form" ref="formRef">
    <kit-simple-field-wrapper
      :error="Boolean(errors?.amount)"
      :message="errors?.amount ? $t(`transaction.form.errors.${errors.amount}`) : ''"
    >
      <kit-money-input
        v-model="amount"
        v-model:currency="currency"
        :placeholder="$t('transaction.form.fields.amount.placeholder') + ': 0.00'"
        :min="0"
        :error="Boolean(errors?.amount)"
      />
    </kit-simple-field-wrapper>
    <kit-simple-field-wrapper
      :error="Boolean(errors?.description)"
      :message="errors?.description ? $t(`transaction.form.errors.${errors.description}`) : ''"
    >
      <kit-input
        v-model="description"
        type="text"
        :placeholder="$t('transaction.form.fields.description.placeholder')"
        :error="Boolean(errors?.description)"
      />
    </kit-simple-field-wrapper>
    <div class="form-fields-row">
      <kit-simple-field-wrapper
        :error="Boolean(errors?.date)"
        :message="errors?.date ? $t(`transaction.form.errors.${errors.date}`) : ''"
      >
        <kit-date-picker
          v-model="date"
          full-width
          @click.stop
          :max-date="nowDateUTC()"
          :error="Boolean(errors?.date)"
        />
      </kit-simple-field-wrapper>
      <kit-simple-field-wrapper
        :error="Boolean(errors?.categoryId)"
        :message="errors?.categoryId ? $t(`transaction.form.errors.${errors.categoryId}`) : ''"
      >
        <kit-categories v-model="categoryId" @click.stop :error="Boolean(errors?.categoryId)" />
      </kit-simple-field-wrapper>
    </div>
    <div class="form-buttons-row">
      <kit-button size="lg" @click="handlerUpdateTransaction">{{
        $t('transaction.form.buttons.update')
      }}</kit-button>
      <kit-button size="lg" variant="secondary-gray" @click="handleCloseForm">{{
        $t('transaction.form.buttons.cancel')
      }}</kit-button>
    </div>
  </div>
</template>

<style scoped>
.edit-transaction-form {
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

.form-fields-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
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
