<script setup lang="ts">
import { computed } from 'vue'
import PlanCard from '@/components/planning/PlanCard.vue'
import type { PreparedPlan } from '@/helpers/planning-rest'
import { TRANSACTION_CATEGORIES_COLORS } from '@/constants/transaction-categories'

const props = defineProps<{
  group: { category: string; items: PreparedPlan[]; total: number | null }
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

const categoryColor = computed(() => TRANSACTION_CATEGORIES_COLORS[props.group.category] || '#a1a1aa')
// Subtle tint (~13% alpha via the 8-digit-hex suffix) on the dark card, with the label/total in the
// full category colour — a hint of colour instead of a solid slab that fights the amber progress bars.
const headerTint = computed(() => categoryColor.value + '22')
</script>

<template>
  <div
    class="overflow-hidden rounded-xl"
    :class="
      variant === 'suggestion'
        ? 'border-2 border-dashed border-muted-foreground/25'
        : 'border border-border bg-card'
    "
  >
    <div
      class="flex items-center justify-between px-4 py-3 text-sm font-bold"
      :style="{ color: categoryColor, backgroundColor: variant === 'suggestion' ? undefined : headerTint }"
    >
      <span>{{ $t('categories.' + group.category) }}</span>
      <span>{{ group.total !== null ? `${Math.round(group.total)} ${currency}` : '—' }}</span>
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
