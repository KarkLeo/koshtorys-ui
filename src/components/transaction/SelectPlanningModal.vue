<script setup lang="ts">
import { computed } from 'vue'

import { usePlanningMapperRest } from '@/mappers/planning-rest-mapper'

import ResponsiveSheet from '@/components/ui/responsive-sheet/ResponsiveSheet.vue'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import { formatPlanDate } from '@/helpers/plan-form'

const emit = defineEmits(['close', 'submit'])
const model = defineModel<string | null>()
const props = defineProps<{
  oldPlanningId?: string | null
}>()

// ===== Computed =====

const { planningTables, loading } = usePlanningMapperRest()

const planningTransactionTable = computed(() => {
  return (planningTables?.value ?? [])
    .map((planningTable) => {
      return {
        ...planningTable,
        items: planningTable.items.filter((plan) => plan.type === 'TRANSACTION'),
      }
    })
    .filter((planningTable) => planningTable.items.length > 0)
})

// ===== Handlers =====

const cancelHandler = () => {
  model.value = null
  closeHandler()
}

const submitHandler = () => {
  emit(
    'submit',
    planningTables.value.flatMap((table) => table.items).find((plan) => plan.id === model.value)
      ?.original,
  )
}

const closeHandler = () => {
  emit('close')
}

const sheetOpen = computed({
  get: () => true,
  set: (val: boolean) => {
    if (!val) closeHandler()
  },
})

const isDisabled = (planId: string, transactionCount: number) =>
  planId !== props.oldPlanningId && transactionCount > 0
</script>

<template>
  <ResponsiveSheet v-model:open="sheetOpen" :title="$t('transaction.selectPlanning.title')">
    <div class="flex flex-col gap-6">
      <p class="text-sm text-muted-foreground">
        {{ $t('transaction.selectPlanning.subtitle') }}
      </p>

      <!-- Loading state -->
      <div v-if="loading" class="flex flex-col gap-3">
        <Skeleton class="h-14 w-full rounded-xl" />
        <Skeleton class="h-14 w-full rounded-xl" />
        <Skeleton class="h-14 w-full rounded-xl" />
      </div>

      <!-- Empty state -->
      <p
        v-else-if="planningTransactionTable.length === 0"
        class="my-4 text-center text-sm font-medium italic text-muted-foreground"
      >
        {{ $t('planning.table.empty') }}
      </p>

      <!-- Plan list -->
      <RadioGroup v-else v-model="model" class="gap-0">
        <template v-for="table in planningTransactionTable" :key="table.category">
          <div class="overflow-hidden rounded-xl border border-border">
            <label
              v-for="plan in table.items"
              :key="plan.id"
              class="flex w-full cursor-pointer items-center gap-4 border-t border-border px-4 py-3 first:border-t-0"
              :class="{
                'pointer-events-none opacity-50': isDisabled(plan.id, plan.linkedCount),
              }"
            >
              <RadioGroupItem
                :value="plan.id"
                :disabled="isDisabled(plan.id, plan.linkedCount)"
              />

              <span class="flex min-w-0 flex-1 flex-col gap-0.5">
                <span class="truncate text-sm font-medium">{{ plan.description }}</span>
                <Badge
                  variant="outline"
                  class="w-fit"
                  :style="{ color: plan.categoryColor, borderColor: plan.categoryColor }"
                >
                  {{ plan.categoryName }}
                </Badge>
              </span>

              <span
                v-if="plan.date"
                class="flex shrink-0 items-center gap-1 text-sm text-muted-foreground"
              >
                <IconCalendar class="size-4" />
                {{ formatPlanDate(plan.date) }}
              </span>

              <span class="ml-auto flex shrink-0 flex-row-reverse items-baseline gap-2">
                <span class="text-sm font-medium">{{ plan.amount }} {{ plan.currency }}</span>
                <span
                  v-if="plan.originalAmount && plan.originalCurrency"
                  class="text-xs text-muted-foreground"
                >
                  {{ plan.originalAmount }} {{ plan.originalCurrency }} /
                </span>
              </span>
            </label>
          </div>
        </template>
      </RadioGroup>

      <!-- Action buttons -->
      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="cancelHandler">
          {{ $t('transaction.selectPlanning.buttons.cancel') }}
        </Button>
        <Button @click="submitHandler">
          {{ $t('transaction.selectPlanning.buttons.submit') }}
        </Button>
      </div>
    </div>
  </ResponsiveSheet>
</template>
