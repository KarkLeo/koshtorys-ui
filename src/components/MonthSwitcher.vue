<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { getMonthIndex, getMonthPeriod } from '@/helpers/date.ts'

const model = defineModel<Date>({ default: () => new Date() })

const { monthStartDay = 1 } = defineProps<{ monthStartDay?: number }>()

const showedMonth = computed(() => getMonthIndex(model.value, monthStartDay) + 1)
const currentPeriod = computed(() => getMonthPeriod(monthStartDay, model.value))

const shiftMonth = (delta: number) => {
  model.value = new Date(
    model.value.getFullYear(),
    model.value.getMonth() + delta,
    Math.min(model.value.getDate(), 28),
  )
}
</script>

<template>
  <div class="flex items-center justify-between gap-2 rounded-xl border p-1.5">
    <Button
      variant="ghost"
      size="icon"
      :aria-label="$t('calendar.prev_month')"
      @click="shiftMonth(-1)"
    >
      <ChevronLeft class="size-4" />
    </Button>
    <div class="text-center">
      <div class="text-sm font-semibold">{{ $t(`calendar.months.${showedMonth}`) }}</div>
      <div class="text-xs text-muted-foreground">
        {{ currentPeriod[0].toLocaleDateString() }} – {{ currentPeriod[1].toLocaleDateString() }}
      </div>
    </div>
    <Button
      variant="ghost"
      size="icon"
      :aria-label="$t('calendar.next_month')"
      @click="shiftMonth(1)"
    >
      <ChevronRight class="size-4" />
    </Button>
  </div>
</template>
