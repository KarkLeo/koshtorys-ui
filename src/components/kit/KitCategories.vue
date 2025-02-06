<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORIES_COLORS,
} from '@/constants/transaction-categories.ts'
import KitDropdownWithInput from '@/components/kit/KitDropdownWithInput.vue'

const { t } = useI18n()

const category = ref<string>('')

const getCategoriesLabel = (category: string) => t(`transaction.categories.${category}`)
const getCategoryStyle = (category: string) => ({
  '--color': TRANSACTION_CATEGORIES_COLORS[category.replace(/--.*$/, '') as string] || '',
})
</script>

<template>
  <kit-dropdown-with-input
    v-model="category"
    :options="TRANSACTION_CATEGORIES"
    :placeholder="t('transaction.form.fields.category.placeholder')"
    :getOptionLabel="getCategoriesLabel"
    :getOptionClass="() => 'category-item'"
    :getOptionStyle="getCategoryStyle"
    with-dot
  />
</template>

<style>
.category-item .dropdown-item-dot {
  background-color: var(--color);
}
</style>
