<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { EllipsisVertical, Link2, Pencil, Trash2 } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CURRENCIES_SYMBOL } from '@/constants/currencies.ts'
import { TRANSACTION_CATEGORIES_COLORS } from '@/constants/transaction-categories.ts'
import type { DisplayTransaction } from './types'

const { transaction, showDate = false } = defineProps<{
  transaction: DisplayTransaction
  /** Показывать дату в карточке (плоский список без группировки по дням). */
  showDate?: boolean
}>()

defineEmits<{ edit: [id: string]; delete: [id: string] }>()

const { t, locale } = useI18n()

const categoryColor = computed(
  () => TRANSACTION_CATEGORIES_COLORS[transaction.categoryId.replace(/--.*$/, '')] || '',
)

// Родителя уже кодирует цвет бейджа — текстом показываем только подкатегорию.
const categoryFullName = computed(() => t(`categories.${transaction.categoryId}`))
const categoryLabel = computed(() => {
  const sub = categoryFullName.value.split(':')[1]?.trim()
  return sub || categoryFullName.value
})

const formatAmount = (value: number) => Math.round(value)
const symbol = (currency: string) => CURRENCIES_SYMBOL[currency] || currency
const shortDate = computed(() =>
  transaction.date.toLocaleDateString(locale.value, { day: '2-digit', month: '2-digit' }),
)
</script>

<template>
  <article class="flex flex-nowrap items-center gap-x-3 rounded-xl border bg-card px-4 py-3">
    <div class="flex shrink-0 items-end gap-1.5">
      <p class="text-xl font-semibold leading-none">
        {{ formatAmount(transaction.amount) }}&nbsp;{{ symbol(transaction.currency) }}
      </p>
      <p v-if="transaction.originalAmount" class="text-xs font-medium text-muted-foreground">
        / {{ formatAmount(transaction.originalAmount) }}&nbsp;{{
          symbol(transaction.originalCurrency || '')
        }}
      </p>
    </div>

    <p v-if="transaction.description" class="min-w-0 truncate text-sm">
      {{ transaction.description }}
    </p>

    <Badge
      variant="outline"
      class="max-w-[45%] rounded-full"
      :style="{ color: categoryColor, borderColor: categoryColor }"
      :title="categoryFullName"
    >
      <span class="truncate">{{ categoryLabel }}</span>
    </Badge>

    <Link2 v-if="transaction.planningId" class="size-4 shrink-0 text-primary" />

    <div class="ml-auto flex shrink-0 items-center gap-1.5">
      <p v-if="showDate" class="text-xs text-muted-foreground">{{ shortDate }}</p>

      <!-- modal=false: a modal dropdown locks body pointer-events and runs an aggressive dismiss
           layer that instantly closes the vaul edit Drawer opened from a menu item on touch. -->
      <DropdownMenu :modal="false">
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            class="size-8 shrink-0"
            :aria-label="$t('transaction.list.menu.trigger')"
          >
            <EllipsisVertical class="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click="$emit('edit', transaction.id)">
            <Pencil class="size-4" />
            {{ $t('transaction.list.menu.edit') }}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" @click="$emit('delete', transaction.id)">
            <Trash2 class="size-4" />
            {{ $t('transaction.list.menu.delete') }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </article>
</template>
