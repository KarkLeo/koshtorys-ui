<script setup lang="ts">
import { computed } from 'vue'
import { Pencil, Trash2, Repeat, Calendar, Check, CircleSlash } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { formatPlanDate } from '@/helpers/plan-form'
import type { PreparedPlan } from '@/helpers/planning-rest'

const props = withDefaults(
  defineProps<{ plan: PreparedPlan; variant?: 'plan' | 'suggestion'; disabled?: boolean }>(),
  { variant: 'plan', disabled: false },
)
defineEmits<{
  edit: [id: string]
  delete: [id: string]
  repeat: [id: string]
  cancelRepeat: [id: string]
}>()

const pct = computed(() => {
  if (!props.plan.amount) return 0
  return Math.min(100, Math.round((props.plan.spent / props.plan.amount) * 100))
})
const overspent = computed(() => props.plan.spent > props.plan.amount)

// У предложения нет трат в текущем месяце — прогресс-бар для него бессмыслен.
const showProgress = computed(() => props.variant === 'plan')

const dateLabel = computed(() => formatPlanDate(props.plan.date))
</script>

<template>
  <div class="flex flex-col gap-2 border-t border-border px-4 py-3">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p v-if="plan.type === 'TRANSACTION' && plan.description" class="truncate font-medium">
          {{ plan.description }}
        </p>
        <p class="text-sm" :style="{ color: plan.categoryColor }">{{ plan.categoryName }}</p>
        <p
          v-if="plan.repeat || plan.date"
          class="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"
        >
          <Repeat v-if="plan.repeat" class="size-3.5" />
          <Calendar v-else class="size-3.5" />
          {{ dateLabel || $t('planning.table.repeat') }}
        </p>
      </div>
      <div class="shrink-0 text-right">
        <p class="font-semibold">
          <span v-if="plan.originalAmount && plan.originalCurrency" class="text-xs text-muted-foreground">
            {{ plan.originalAmount }} {{ plan.originalCurrency }} /
          </span>
          {{ plan.amount }} {{ plan.currency }}
        </p>
      </div>
    </div>

    <div v-if="showProgress">
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          class="h-full rounded-full transition-all"
          :class="overspent ? 'bg-destructive' : 'bg-primary'"
          :style="{ width: pct + '%' }"
        />
      </div>
      <p
        class="mt-1 text-xs"
        :class="overspent ? 'text-destructive' : 'text-muted-foreground'"
      >
        {{ plan.spent }} / {{ plan.amount }} {{ plan.currency }}
      </p>
    </div>

    <div class="flex justify-end gap-1">
      <template v-if="variant === 'plan'">
        <Button variant="ghost" size="icon" class="size-8" :aria-label="$t('planning.actions.edit')" @click="$emit('edit', plan.id)">
          <Pencil class="size-4" />
        </Button>
        <Button variant="ghost" size="icon" class="size-8" :aria-label="$t('planning.actions.delete')" @click="$emit('delete', plan.id)">
          <Trash2 class="size-4" />
        </Button>
      </template>
      <template v-else>
        <Button variant="ghost" size="icon" class="size-8" :disabled="disabled" :aria-label="$t('planning.actions.cancel_repeat')" @click="$emit('cancelRepeat', plan.id)">
          <CircleSlash class="size-4" />
        </Button>
        <Button variant="ghost" size="icon" class="size-8" :disabled="disabled" :aria-label="$t('planning.actions.repeat')" @click="$emit('repeat', plan.id)">
          <Check class="size-4" />
        </Button>
      </template>
    </div>
  </div>
</template>
