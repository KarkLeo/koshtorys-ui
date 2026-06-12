<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORIES_COLORS,
} from '@/constants/transaction-categories'
import { getMainCategory } from '@/helpers/category'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const model = defineModel<string>({ default: '' })
defineProps<{ error?: boolean }>()
const { t } = useI18n()
const colorOf = (id: string) => TRANSACTION_CATEGORIES_COLORS[getMainCategory(id)] || 'transparent'
</script>

<template>
  <Select v-model="model">
    <SelectTrigger :class="error ? 'border-destructive' : ''">
      <SelectValue :placeholder="t('transaction.form.fields.category.placeholder')">
        <span v-if="model" class="inline-flex items-center gap-2">
          <span class="size-2 rounded-full" :style="{ backgroundColor: colorOf(model) }" />
          {{ t(`categories.${model}`) }}
        </span>
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="id in TRANSACTION_CATEGORIES" :key="id" :value="id">
        <span class="inline-flex items-center gap-2">
          <span class="size-2 rounded-full" :style="{ backgroundColor: colorOf(id) }" />
          {{ t(`categories.${id}`) }}
        </span>
      </SelectItem>
    </SelectContent>
  </Select>
</template>
