<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDebounceFn } from '@vueuse/core'
import { ListFilter, X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TRANSACTION_CATEGORIES_COLORS } from '@/constants/transaction-categories.ts'
import { createEmptyFilters, type TransactionFilters, type TransactionSort } from './types'

const filters = defineModel<TransactionFilters>('filters', { required: true })
const sort = defineModel<TransactionSort>('sort', { required: true })

const { t } = useI18n()

const TOP_CATEGORIES = Object.keys(TRANSACTION_CATEGORIES_COLORS)
const SORT_OPTIONS: TransactionSort[] = [
  'date-desc',
  'date-asc',
  'amount-desc',
  'amount-asc',
  'category',
]

// Локальный инпут поиска -> в модель с debounce.
const searchInput = ref(filters.value.search)
const applySearch = useDebounceFn((value: string) => {
  filters.value = { ...filters.value, search: value }
}, 300)
watch(searchInput, applySearch)
// Внешний сброс (например, смена месяца) очищает и инпут.
watch(
  () => filters.value.search,
  (search) => {
    if (search === '') searchInput.value = ''
  },
)

const activeCount = computed(
  () => filters.value.categories.length + (filters.value.plan !== 'all' ? 1 : 0),
)

const toggleCategory = (category: string) => {
  const categories = filters.value.categories.includes(category)
    ? filters.value.categories.filter((c) => c !== category)
    : [...filters.value.categories, category]
  filters.value = { ...filters.value, categories }
}

const setPlan = (plan: TransactionFilters['plan']) => {
  filters.value = { ...filters.value, plan }
}

const resetAll = () => {
  filters.value = createEmptyFilters()
  searchInput.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <Input
        v-model="searchInput"
        :placeholder="t('transaction.list.search_placeholder')"
        class="min-w-0 flex-1"
      />

      <Popover>
        <PopoverTrigger as-child>
          <Button variant="outline" class="shrink-0 gap-1.5">
            <ListFilter class="size-4" />
            <span class="hidden sm:inline">{{ t('transaction.list.filters.button') }}</span>
            <Badge v-if="activeCount > 0" class="size-5 justify-center rounded-full p-0">
              {{ activeCount }}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" class="w-72">
          <div class="flex flex-col gap-4">
            <div>
              <p class="mb-2 text-sm font-medium">{{ t('transaction.list.filters.categories') }}</p>
              <div class="flex max-h-56 flex-col gap-2 overflow-y-auto">
                <Label
                  v-for="category in TOP_CATEGORIES"
                  :key="category"
                  class="flex items-center gap-2 font-normal"
                >
                  <Checkbox
                    :model-value="filters.categories.includes(category)"
                    @update:model-value="toggleCategory(category)"
                  />
                  <span
                    class="size-2 shrink-0 rounded-full"
                    :style="{ backgroundColor: TRANSACTION_CATEGORIES_COLORS[category] }"
                  />
                  {{ t(`categories.${category}`) }}
                </Label>
              </div>
            </div>

            <div>
              <p class="mb-2 text-sm font-medium">{{ t('transaction.list.filters.plan') }}</p>
              <RadioGroup
                :model-value="filters.plan"
                class="gap-2"
                @update:model-value="setPlan($event as TransactionFilters['plan'])"
              >
                <Label class="flex items-center gap-2 font-normal">
                  <RadioGroupItem value="all" /> {{ t('transaction.list.filters.plan_all') }}
                </Label>
                <Label class="flex items-center gap-2 font-normal">
                  <RadioGroupItem value="linked" /> {{ t('transaction.list.filters.plan_linked') }}
                </Label>
                <Label class="flex items-center gap-2 font-normal">
                  <RadioGroupItem value="unlinked" />
                  {{ t('transaction.list.filters.plan_unlinked') }}
                </Label>
              </RadioGroup>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Select :model-value="sort" @update:model-value="sort = $event as TransactionSort">
        <SelectTrigger class="w-auto shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem v-for="option in SORT_OPTIONS" :key="option" :value="option">
            {{ t(`transaction.list.sort.${option}`) }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div v-if="activeCount > 0" class="flex flex-wrap items-center gap-1.5">
      <Badge
        v-for="category in filters.categories"
        :key="category"
        variant="outline"
        class="cursor-pointer gap-1 rounded-full"
        :style="{
          color: TRANSACTION_CATEGORIES_COLORS[category],
          borderColor: TRANSACTION_CATEGORIES_COLORS[category],
        }"
        @click="toggleCategory(category)"
      >
        {{ t(`categories.${category}`) }}
        <X class="size-3" />
      </Badge>

      <Badge
        v-if="filters.plan !== 'all'"
        variant="outline"
        class="cursor-pointer gap-1 rounded-full"
        @click="setPlan('all')"
      >
        {{ t(`transaction.list.filters.chip_plan_${filters.plan}`) }}
        <X class="size-3" />
      </Badge>

      <Button
        variant="ghost"
        size="sm"
        class="h-6 px-2 text-xs text-muted-foreground"
        @click="resetAll"
      >
        {{ t('transaction.list.filters.reset_all') }}
      </Button>
    </div>
  </div>
</template>
