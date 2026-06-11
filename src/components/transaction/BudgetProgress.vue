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
  <WaveChart :current="current" :max="max" :message="message" />
</template>
