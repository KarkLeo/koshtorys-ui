<script setup lang="ts">
import PlanCard from '@/components/planning/PlanCard.vue'
import type { PreparedPlan } from '@/helpers/planning-rest'
import { TRANSACTION_CATEGORIES_COLORS } from '@/constants/transaction-categories'

const props = defineProps<{
  group: { category: string; items: PreparedPlan[]; total: number }
  currency: string
  variant?: 'plan' | 'suggestion'
  busyId?: string | null
}>()
defineEmits<{
  edit: [id: string]
  delete: [id: string]
  repeat: [id: string]
  cancelRepeat: [id: string]
}>()

const categoryColor = () => TRANSACTION_CATEGORIES_COLORS[props.group.category] || ''
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border">
    <div
      class="relative flex items-center justify-between px-4 py-3 text-sm font-bold"
      :style="{ '--color': categoryColor() }"
    >
      <div class="category-tint" />
      <span>{{ $t('categories.' + group.category) }}</span>
      <span>{{ Math.round(group.total) }} {{ currency }}</span>
    </div>
    <div class="flex flex-col">
      <PlanCard
        v-for="plan in group.items"
        :key="plan.id"
        :plan="plan"
        :variant="props.variant ?? 'plan'"
        :disabled="props.busyId === plan.id"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @repeat="$emit('repeat', $event)"
        @cancel-repeat="$emit('cancelRepeat', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.category-tint {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-color: var(--color);
  opacity: 0.5;
}
</style>
