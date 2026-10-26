<script lang="ts" setup>
import type { MonthPickerRootEmits, MonthPickerRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import {
  MonthPickerCell,
  MonthPickerCellTrigger,
  MonthPickerGrid,
  MonthPickerGridBody,
  MonthPickerGridRow,
  MonthPickerHeader,
  MonthPickerHeading,
  MonthPickerNext,
  MonthPickerPrev,
  MonthPickerRoot,
  useForwardPropsEmits,
} from 'reka-ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

const props = withDefaults(
  defineProps<MonthPickerRootProps & { class?: HTMLAttributes['class'] }>(),
  { modelValue: undefined },
)
const emits = defineEmits<MonthPickerRootEmits>()

const delegatedProps = reactiveOmit(props, 'class', 'locale')
const forwarded = useForwardPropsEmits(delegatedProps, emits)

// Follows the interface language unless a caller pins one, the way Calendar does.
const { locale: interfaceLocale } = useI18n()
const locale = computed(() => props.locale ?? interfaceLocale.value)

const navClass = cn(
  buttonVariants({ variant: 'outline' }),
  'size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
)
</script>

<template>
  <MonthPickerRoot
    v-slot="{ grid }"
    v-bind="forwarded"
    :locale="locale"
    data-slot="month-picker"
    :class="cn('p-3', props.class)"
  >
    <MonthPickerHeader class="flex w-full items-center justify-between">
      <MonthPickerPrev data-slot="month-picker-prev" :class="navClass">
        <ChevronLeft class="size-4" />
      </MonthPickerPrev>
      <MonthPickerHeading data-slot="month-picker-heading" class="text-sm font-medium" />
      <MonthPickerNext data-slot="month-picker-next" :class="navClass">
        <ChevronRight class="size-4" />
      </MonthPickerNext>
    </MonthPickerHeader>

    <MonthPickerGrid class="mt-4 w-full border-collapse">
      <MonthPickerGridBody>
        <MonthPickerGridRow
          v-for="(months, index) in grid.rows"
          :key="`months-${index}`"
          class="mt-1 flex w-full gap-1"
        >
          <MonthPickerCell
            v-for="month in months"
            :key="month.toString()"
            :date="month"
            class="p-0 text-center"
          >
            <!-- No "today" highlight: reka marks the calendar month, which is not the current
                 financial month once the month starts after the 15th. -->
            <MonthPickerCellTrigger
              :month="month"
              data-slot="month-picker-cell-trigger"
              :class="
                cn(
                  buttonVariants({ variant: 'ghost' }),
                  'h-9 w-16 p-0 font-normal capitalize cursor-default',
                  'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground',
                  'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
                )
              "
            />
          </MonthPickerCell>
        </MonthPickerGridRow>
      </MonthPickerGridBody>
    </MonthPickerGrid>
  </MonthPickerRoot>
</template>
