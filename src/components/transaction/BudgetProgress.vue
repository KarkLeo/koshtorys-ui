<script setup lang="ts">
import { computed } from 'vue'
import WaveChart from '@/components/transaction/WaveChart.vue'
import { CURRENCIES_SYMBOL } from '@/constants/currencies.ts'

const {
  current,
  max,
  currency,
  variant = 'bar',
} = defineProps<{
  current: number
  max: number
  currency: string
  variant?: 'bar' | 'wave'
}>()

const message = computed(
  () => `${Math.round(current)} / ${Math.round(max)} ${CURRENCIES_SYMBOL[currency] || currency}`,
)
const percent = computed(() => (max > 0 ? Math.min(100, (current / max) * 100) : 0))
const overspent = computed(() => max > 0 && current > max)
</script>

<template>
  <WaveChart v-if="variant === 'wave'" :current="current" :max="max" :message="message" />

  <div v-else class="relative overflow-hidden rounded-xl border p-1">
    <div
      class="h-10 rounded-lg transition-[width] duration-700 ease-out"
      :class="overspent ? 'bg-gradient-to-r from-rose-500 to-red-600' : 'bg-gradient-to-r from-violet-500 to-pink-500'"
      :style="{ width: `${percent}%` }"
    />
    <p class="absolute inset-0 grid place-items-center text-lg font-bold">
      {{ message }}
    </p>
  </div>
</template>
