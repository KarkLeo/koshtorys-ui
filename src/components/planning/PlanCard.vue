<script setup lang="ts">
import { computed } from 'vue'
import { EllipsisVertical, Pencil, Trash2, Repeat, Calendar, Check, CircleSlash } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
// Когда converted === false, plan.amount — неконвертированная сумма в СВОЕЙ валюте, а
// plan.spent — всегда в базовой (см. DisplayTransaction); сравнивать их прогресс-баром
// значит смешивать валюты, поэтому в этом состоянии бар и строка spent/amount не рендерятся.
const showProgress = computed(() => props.variant === 'plan' && props.plan.converted)

const dateLabel = computed(() => formatPlanDate(props.plan.date))

// The badge colour already encodes the parent category, so the pill shows only the
// subcategory (the part after ":").
const categoryLabel = computed(
  () => props.plan.categoryName.split(':')[1]?.trim() || props.plan.categoryName,
)
</script>

<template>
  <div class="flex flex-col gap-2 border-t border-border px-4 py-3 transition-colors hover:bg-muted/40">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 space-y-1">
        <p v-if="plan.type === 'TRANSACTION' && plan.description" class="truncate font-medium">
          {{ plan.description }}
        </p>
        <Badge
          variant="outline"
          class="max-w-44 rounded-full"
          :style="{ color: plan.categoryColor, borderColor: plan.categoryColor }"
          :title="plan.categoryName"
        >
          <span class="truncate">{{ categoryLabel }}</span>
        </Badge>
        <p
          v-if="plan.repeat || plan.date"
          class="flex items-center gap-1 text-xs text-muted-foreground"
        >
          <Repeat v-if="plan.repeat" class="size-3.5" />
          <Calendar v-else class="size-3.5" />
          {{ dateLabel || $t('planning.table.repeat') }}
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <p class="font-semibold">
          <span v-if="plan.originalAmount && plan.originalCurrency" class="text-xs text-muted-foreground">
            {{ plan.originalAmount }} {{ plan.originalCurrency }} /
          </span>
          {{ plan.amount }} {{ plan.currency }}
        </p>

        <!-- modal=false: a modal dropdown locks body pointer-events and runs an aggressive dismiss
             layer that instantly closes the vaul edit Drawer opened from a menu item on touch. -->
        <DropdownMenu v-if="variant === 'plan'" :modal="false">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="-mr-2 size-8" :aria-label="$t('planning.actions.menu')">
              <EllipsisVertical class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="$emit('edit', plan.id)">
              <Pencil class="size-4" />
              {{ $t('planning.actions.edit') }}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" @click="$emit('delete', plan.id)">
              <Trash2 class="size-4" />
              {{ $t('planning.actions.delete') }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <template v-else>
          <Button
            variant="ghost"
            size="icon"
            class="size-8"
            :disabled="disabled"
            :title="$t('planning.actions.cancel_repeat')"
            :aria-label="$t('planning.actions.cancel_repeat')"
            @click="$emit('cancelRepeat', plan.id)"
          >
            <CircleSlash class="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="-mr-2 size-8"
            :disabled="disabled"
            :title="$t('planning.actions.repeat')"
            :aria-label="$t('planning.actions.repeat')"
            @click="$emit('repeat', plan.id)"
          >
            <Check class="size-4" />
          </Button>
        </template>
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
  </div>
</template>
