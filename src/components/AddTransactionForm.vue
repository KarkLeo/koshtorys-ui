<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { useMe } from '@/hooks/auth-hooks.ts'
import { CURRENCIES } from '@/constants/currencies.ts'

import KitMoneyInput from '@/components/kit/KitMoneyInput.vue'
import KitInput from '@/components/kit/KitInput.vue'
import KitButton from '@/components/kit/KitButton.vue'
import KitDatePicker from '@/components/kit/KitDatePicker.vue'
import KitCategories from '@/components/kit/KitCategories.vue'

import { useCreateTransaction } from '@/hooks/transaction-hooks.ts'
import { nowDateUTC } from '@/helpers/time.ts'

const { me } = useMe()

const formRef = ref<HTMLElement | null>(null)
const transactionValue = ref('')
const currency = ref(me.value?.me.currency || CURRENCIES[0])
const category = ref<string>('')
const date = ref<Date>(nowDateUTC())
const isOpen = ref(false)
const transactionTitle = ref('')

const { createTransaction } = useCreateTransaction()

const handlerCreateTransaction = async () => {
  if (!transactionValue.value || !transactionTitle.value || !category.value) {
    return
  }

  await createTransaction({
    transactionData: {
      amount: parseFloat(transactionValue.value),
      currency: currency.value,
      description: transactionTitle.value,
      categoryId: category.value,
      date: date.value.toISOString(),
    },
  })

  transactionValue.value = ''
  transactionTitle.value = ''
  category.value = ''
  date.value = nowDateUTC()
  currency.value = me.value?.me.currency || CURRENCIES[0]
}

const handleClickOutside = (event: MouseEvent) => {
  if (!formRef.value) return

  if (!formRef.value.contains(event.target as Node)) {
    isOpen.value = Boolean(transactionValue.value) || Boolean(transactionTitle.value)

    if (!isOpen.value) {
      category.value = ''
      date.value = nowDateUTC()
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div :class="['add-transaction-form', { active: isOpen }]" ref="formRef">
    <kit-money-input
      v-model="transactionValue"
      @focus="isOpen = true"
      v-model:currency="currency"
      placeholder="0.00"
    />
    <kit-input
      v-model="transactionTitle"
      @focus="isOpen = true"
      type="text"
      placeholder="Description"
    />
    <div class="form-grid">
      <kit-date-picker v-model="date" full-width @click.stop />
      <kit-categories v-model="category" @click.stop />
    </div>
    <kit-button size="xl" @click="handlerCreateTransaction">Save</kit-button>
  </div>
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

  border: 1px solid var(--border-primary);
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
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
}
</style>
