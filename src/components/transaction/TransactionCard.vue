<script setup lang="ts">
import { computed } from 'vue'
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

const { transaction } = defineProps<{ transaction: DisplayTransaction }>()

defineEmits<{ edit: [id: string]; delete: [id: string] }>()

const categoryColor = computed(
  () => TRANSACTION_CATEGORIES_COLORS[transaction.categoryId.replace(/--.*$/, '')] || '',
)

const formatAmount = (value: number) => Math.round(value)
const symbol = (currency: string) => CURRENCIES_SYMBOL[currency] || currency
</script>

<template>
  <article class="flex flex-col gap-2 rounded-xl border bg-card p-4">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div class="flex items-end gap-1.5">
        <p class="text-2xl font-semibold leading-none">
          {{ formatAmount(transaction.amount) }}&nbsp;{{ symbol(transaction.currency) }}
        </p>
        <p v-if="transaction.originalAmount" class="text-sm font-medium text-muted-foreground">
          / {{ formatAmount(transaction.originalAmount) }}&nbsp;{{
            symbol(transaction.originalCurrency || '')
          }}
        </p>
      </div>

      <Badge
        variant="outline"
        class="max-w-44 rounded-full"
        :style="{ color: categoryColor, borderColor: categoryColor }"
      >
        <span class="truncate">{{ $t(`categories.${transaction.categoryId}`) }}</span>
      </Badge>

      <Link2 v-if="transaction.planningId" class="size-4 shrink-0 text-primary" />

      <p class="ml-auto text-sm font-semibold">{{ transaction.date.toLocaleDateString() }}</p>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="icon" class="size-8 shrink-0">
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

    <p v-if="transaction.description" class="text-sm text-muted-foreground">
      {{ transaction.description }}
    </p>
  </article>
</template>
