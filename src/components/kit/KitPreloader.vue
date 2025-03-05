<script setup lang="ts">
import { computed } from 'vue'

const { size = 'sm' } = defineProps<{
  size?: 'sm' | 'md' | 'lg' | 'xl'
}>()

const SIZE = {
  sm: {
    width: 28,
    strokeWidth: 4,
  },
  md: {
    width: 48,
    strokeWidth: 6,
  },
  lg: {
    width: 56,
    strokeWidth: 6,
  },
  xl: {
    width: 64,
    strokeWidth: 8,
  },
}

const calculateParams = (size: keyof typeof SIZE) => {
  const { width, strokeWidth } = SIZE[size]
  const center = width / 2
  const radius = (width - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  return { radius, circumference, width, strokeWidth, center }
}

const params = computed(() => calculateParams(size))
</script>
<template>
  <svg
    :width="params.width"
    :height="params.width"
    :viewBox="`0 0 ${params.width} ${params.width}`"
  >
    <circle
      :cx="params.center"
      :cy="params.center"
      :r="params.radius"
      stroke="#1F242F"
      :stroke-width="params.strokeWidth"
      fill="none"
      :stroke-dasharray="params.circumference"
      stroke-dashoffset="0"
      stroke-linecap="round"
      :transform="`rotate(-90 ${params.center} ${params.center})`"
    ></circle>
    <circle
      :cx="params.center"
      :cy="params.center"
      :r="params.radius"
      stroke="#9E77ED"
      :stroke-width="params.strokeWidth"
      fill="none"
      :stroke-dasharray="params.circumference"
      :stroke-dashoffset="params.circumference"
      stroke-linecap="round"
      :transform="`rotate(-90 ${params.center} ${params.center})`"
    >
      <animate
        attributeName="stroke-dashoffset"
        :from="params.circumference"
        to="0"
        dur="1.2s"
        keySplines="0.42 0 0.58 1"
        fill="freeze"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
</template>
