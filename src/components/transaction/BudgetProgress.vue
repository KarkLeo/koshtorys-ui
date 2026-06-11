<script setup lang="ts">
import { computed } from 'vue'
import WaveChart from '@/components/transaction/WaveChart.vue'
import { CURRENCIES_SYMBOL } from '@/constants/currencies.ts'

const { current, max, currency } = defineProps<{
  current: number
  max: number
  currency: string
}>()

const message = computed(
  () => `${Math.round(current)} / ${Math.round(max)} ${CURRENCIES_SYMBOL[currency] || currency}`,
)
</script>

<template>
  <div class="rounded-xl border p-1">
    <WaveChart :current="current" :max="max" :message="message" />
  </div>
</template>

<style scoped>
/* Рамка — на новых Shadcn-токенах (как у MonthSwitcher). Внутренняя легаси-рамка
   WaveChart завязана на старые переменные из base.css, которых нет в новом
   контексте, — гасим её, не трогая сам WaveChart. */
:deep(.wave-chart-border) {
  border: none;
  padding: 0;
}
:deep(.wave-chart) {
  border-radius: var(--radius);
}
/* Типографика сообщения тоже была на легаси-переменных. */
:deep(.wave-chart-message) {
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 700;
  color: var(--foreground);
}
</style>
