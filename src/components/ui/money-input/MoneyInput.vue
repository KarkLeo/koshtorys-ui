<script setup lang="ts">
import { CURRENCIES } from '@/constants/currencies'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const amount = defineModel<string>('amount', { default: '' })
const currency = defineModel<string>('currency', { default: 'EUR' })
defineProps<{ min?: number; error?: boolean }>()
</script>

<template>
  <div class="flex items-baseline justify-between gap-4" :class="error ? 'text-destructive' : ''">
    <input
      v-model="amount"
      type="number"
      inputmode="decimal"
      :min="min ?? 0"
      placeholder="00.00"
      class="w-full bg-transparent text-5xl font-bold tabular-nums outline-none placeholder:text-muted-foreground"
    />
    <Select v-model="currency">
      <SelectTrigger class="w-auto border-none shadow-none text-lg font-medium">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="c in CURRENCIES" :key="c" :value="c">{{ c }}</SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
