<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ChevronDownIcon } from 'lucide-vue-next'
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORIES_COLORS,
} from '@/constants/transaction-categories'
import { getMainCategory } from '@/helpers/category'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox'

const model = defineModel<string>({ default: '' })
defineProps<{ error?: boolean }>()
const { t } = useI18n()
const colorOf = (id: string) => TRANSACTION_CATEGORIES_COLORS[getMainCategory(id)] || 'transparent'
</script>

<template>
  <Combobox v-model="model">
    <ComboboxAnchor class="w-full">
      <ComboboxTrigger
        :class="[
          'flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs',
          error ? 'border-destructive' : 'border-input',
        ]"
      >
        <span v-if="model" class="inline-flex items-center gap-2 truncate">
          <span class="size-2 shrink-0 rounded-full" :style="{ backgroundColor: colorOf(model) }" />
          {{ t(`categories.${model}`) }}
        </span>
        <span v-else class="text-muted-foreground">
          {{ t('transaction.form.fields.category.placeholder') }}
        </span>
        <ChevronDownIcon class="size-4 shrink-0 opacity-50" />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxList class="w-[var(--reka-popper-anchor-width)] p-0">
      <ComboboxInput :placeholder="t('transaction.form.fields.category.search')" />
      <ComboboxEmpty>{{ t('transaction.list.empty_filtered') }}</ComboboxEmpty>
      <div class="max-h-[300px] overflow-y-auto p-1">
        <ComboboxItem v-for="id in TRANSACTION_CATEGORIES" :key="id" :value="id">
          <span class="size-2 shrink-0 rounded-full" :style="{ backgroundColor: colorOf(id) }" />
          {{ t(`categories.${id}`) }}
        </ComboboxItem>
      </div>
    </ComboboxList>
  </Combobox>
</template>
