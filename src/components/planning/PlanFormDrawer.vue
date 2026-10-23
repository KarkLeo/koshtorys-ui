<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ValidationError } from 'yup'
import { toast } from 'vue-sonner'
import { CalendarDate, getLocalTimeZone, type DateValue } from '@internationalized/date'
import type { AcceptableValue } from 'reka-ui'

import { CURRENCIES } from '@/constants/currencies'
import { TRANSACTION_CATEGORIES } from '@/constants/transaction-categories'
import { useMe } from '@/hooks/auth-hooks'
import { useStatisticDateStore } from '@/stores/statisticDateStore'
import { useMonthlyPlanning, useMonthPlans } from '@/hooks/planning-rest-hooks'
import { useCreatePlan, useUpdatePlan } from '@/hooks/planning-write-hooks'
import { planSchema } from '@/validations/plan'
import { mapApiErrorCodes } from '@/helpers/api-errors'
import {
  buildCreatePlanDto,
  buildUpdatePlanDto,
  isPlanMonthLocked,
  planDateBounds,
  planMonthOf,
  planMonthWindow,
  type PlanFormState,
} from '@/helpers/plan-form'
import type { PlanMonth } from '@/helpers/transaction-form'
import type { components } from '@/api/types'

import { ResponsiveSheet } from '@/components/ui/responsive-sheet'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { MoneyInput } from '@/components/ui/money-input'
import { CategoryPicker } from '@/components/ui/category-picker'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { MonthPicker } from '@/components/ui/month-picker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import IconCalendar from '@/components/icons/IconCalendar.vue'

type Plan = components['schemas']['PlanResponseDto']

// ---------------------------------------------------------------------------
// Props / emits
// ---------------------------------------------------------------------------

// linkedCount: how many transactions are linked to the plan being edited; it keeps the plan in its month.
const props = defineProps<{ mode: 'add' | 'edit'; plan?: Plan; linkedCount?: number }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ created: []; updated: [] }>()

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

const { t } = useI18n()
const { user } = useMe()
const { statisticDate } = useStatisticDateStore()
const { plans } = useMonthlyPlanning()
const { createPlan, loading: createLoading } = useCreatePlan()
const { updatePlan, loading: updateLoading } = useUpdatePlan()

const loading = computed(() => createLoading.value || updateLoading.value)
const drawerTitle = computed(() =>
  props.mode === 'edit' ? t('planning.form.edit_title') : t('planning.form.add_title'),
)
const submitLabel = computed(() =>
  props.mode === 'edit' ? t('planning.form.buttons.update') : t('planning.form.buttons.add'),
)

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

const type = ref<'TRANSACTION' | 'CATEGORY'>('TRANSACTION')

/**
 * Reka-ui's single-mode ToggleGroup emits `undefined` when the active item is
 * toggled off (re-clicking the already-selected item). `type` must stay
 * non-nullable, so the setter ignores anything that isn't a known plan type —
 * clicking the active toggle is a no-op rather than clearing the selection.
 */
const toggleType = computed<'TRANSACTION' | 'CATEGORY', AcceptableValue | AcceptableValue[] | undefined>({
  get: () => type.value,
  set: (value) => {
    if (value === 'TRANSACTION' || value === 'CATEGORY') type.value = value
  },
})

const amount = ref('')
const currency = ref(user.value?.currency || CURRENCIES[0])
const description = ref('')
const date = ref<Date | null>(null)
const categoryId = ref('')
const repeat = ref(false)
const errors = ref<Record<string, string>>({})

const monthStartDay = computed(() => user.value?.monthStartDay ?? 1)
const viewedMonth = (): PlanMonth => planMonthOf(statisticDate.value, monthStartDay.value)
const sameMonth = (a: PlanMonth, b: PlanMonth) => a.monthIndex === b.monthIndex && a.year === b.year

// The financial month the plan is saved into: the month being viewed for a new plan, its own month
// when editing. A one-off plan with a date takes it from the date.
const month = ref<PlanMonth>(viewedMonth())

const clearForm = () => {
  type.value = 'TRANSACTION'
  amount.value = ''
  currency.value = user.value?.currency || CURRENCIES[0]
  description.value = ''
  categoryId.value = ''
  date.value = null
  repeat.value = false
  month.value = viewedMonth()
  errors.value = {}
}

/** Предзаполнение формы существующим планом (edit-режим). */
const fillFromPlan = (plan: Plan) => {
  type.value = plan.type
  amount.value = String(plan.amount)
  currency.value = plan.currency || user.value?.currency || CURRENCIES[0]
  description.value = plan.description || ''
  // Календарный день берём из первых 10 символов ISO — без сдвига таймзоной.
  if (plan.date) {
    const [y, m, d] = plan.date.slice(0, 10).split('-').map(Number)
    date.value = new Date(y, m - 1, d)
  } else {
    date.value = null
  }
  categoryId.value = plan.categoryId || ''
  repeat.value = plan.repeat || false
  month.value = { monthIndex: plan.monthIndex, year: plan.year }
  errors.value = {}
}

if (props.mode === 'edit' && props.plan) fillFromPlan(props.plan)
watch(
  () => props.plan,
  (plan) => {
    if (props.mode === 'edit' && plan) fillFromPlan(plan)
  },
)

// ---------------------------------------------------------------------------
// Month: a plan may be placed in any month of the window, unless it is locked to its own
// ---------------------------------------------------------------------------

const monthLocked = computed(
  () =>
    props.mode === 'edit' &&
    !!props.plan &&
    isPlanMonthLocked(
      { monthIndex: props.plan.monthIndex, year: props.plan.year },
      props.linkedCount ?? 0,
      monthStartDay.value,
      new Date(),
    ),
)
const lockedByTransaction = computed(() => monthLocked.value && (props.linkedCount ?? 0) > 0)

// With a date the calendar picks the month; without one the month pill does.
const showMonthPill = computed(() => !(type.value === 'TRANSACTION' && date.value))

const isMonthOpen = ref(false)

const toMonthValue = (m: PlanMonth) => new CalendarDate(m.year, m.monthIndex + 1, 1)

const monthValue = computed<DateValue | undefined>({
  get: () => toMonthValue(month.value),
  set: (value) => {
    if (value) {
      month.value = { monthIndex: value.month - 1, year: value.year }
      // A date kept from the one-off type would contradict the new month once the type is switched back.
      if (date.value && !sameMonth(planMonthOf(date.value, monthStartDay.value), month.value)) {
        date.value = null
      }
      isMonthOpen.value = false
    }
  },
})

const monthWindow = computed(() => planMonthWindow(monthStartDay.value, new Date()))

const monthLabel = (m: PlanMonth) => `${t(`calendar.months.${m.monthIndex + 1}`)} ${m.year}`

// ---------------------------------------------------------------------------
// Category filter: динамический план на категорию в месяце может быть только один
// ---------------------------------------------------------------------------

// The viewed month's plans are already loaded; any other month is fetched for dynamic plans only.
const otherMonth = computed(() =>
  type.value === 'CATEGORY' && !sameMonth(month.value, viewedMonth()) ? month.value : null,
)
const { monthPlans } = useMonthPlans(otherMonth)
const targetPlans = computed(() => (otherMonth.value ? monthPlans.value : plans.value))

const availableCategories = computed<string[]>(() => {
  if (type.value !== 'CATEGORY') return TRANSACTION_CATEGORIES
  const used = targetPlans.value
    .filter((plan) => plan.type === 'CATEGORY' && plan.id !== props.plan?.id)
    .map((plan) => plan.categoryId)
  return TRANSACTION_CATEGORIES.filter((category) => !used.includes(category))
})

// ---------------------------------------------------------------------------
// Date picker (Popover + Calendar; мост Date <-> CalendarDate)
// ---------------------------------------------------------------------------

const isDateOpen = ref(false)

const toDateValue = (d: Date) => new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())

const calendarDate = computed<DateValue | undefined>({
  get: () => (date.value ? toDateValue(date.value) : undefined),
  set: (value) => {
    if (value) {
      date.value = value.toDate(getLocalTimeZone())
      month.value = planMonthOf(date.value, monthStartDay.value)
      isDateOpen.value = false
    }
  },
})

const dateBounds = computed(() =>
  planDateBounds(month.value, monthLocked.value, monthStartDay.value, new Date()),
)
const minDate = computed<DateValue>(() => toDateValue(dateBounds.value.min))
const maxDate = computed<DateValue>(() => toDateValue(dateBounds.value.max))
// The calendar opens on the plan's date, or without one on the plan's month rather than today.
const datePlaceholder = computed<DateValue>(() =>
  toDateValue(date.value ?? planDateBounds(month.value, true, monthStartDay.value, new Date()).min),
)

const datePillLabel = computed(() =>
  date.value
    ? date.value.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : t('planning.form.fields.date.placeholder'),
)

// ---------------------------------------------------------------------------
// Submit
// ---------------------------------------------------------------------------

const formState = (): PlanFormState => ({
  type: type.value,
  amount: amount.value,
  currency: currency.value,
  description: description.value,
  categoryId: categoryId.value,
  date: date.value,
  repeat: repeat.value,
})

const validateForm = async (): Promise<boolean> => {
  try {
    const state = formState()
    await planSchema.validate(
      {
        type: state.type,
        amount: parseFloat(state.amount || '0'),
        currency: state.currency,
        description: state.description,
        categoryId: state.categoryId,
        date: state.date ?? undefined,
        repeat: state.repeat,
      },
      { abortEarly: false },
    )
    errors.value = {}
    return true
  } catch (e) {
    errors.value = (e as ValidationError).inner.reduce((acc: Record<string, string>, err) => {
      if (err.path && !acc[err.path]) acc[err.path] = err.message
      return acc
    }, {})
    return false
  }
}

const handleSubmit = async () => {
  if (!(await validateForm())) return
  // The target month's plans may have arrived after the category was picked.
  if (type.value === 'CATEGORY' && !availableCategories.value.includes(categoryId.value)) {
    errors.value = { categoryId: 'category_plan_exists' }
    return
  }

  const { monthIndex, year } = month.value
  // A plan saved outside the month on screen drops out of view, so the toast says where it went.
  const savedElsewhere = !sameMonth(month.value, viewedMonth())
  const successMessage = (fallback: string) =>
    savedElsewhere
      ? t('planning.form.messages.saved_to_month', { month: monthLabel(month.value) })
      : t(fallback)

  try {
    if (props.mode === 'edit') {
      if (!props.plan) return
      await updatePlan(props.plan.id, buildUpdatePlanDto(formState(), monthIndex, year))
      toast.success(successMessage('planning.form.messages.update_success'))
      open.value = false
      emit('updated')
      return
    }

    await createPlan(buildCreatePlanDto(formState(), monthIndex, year))
    toast.success(successMessage('planning.form.messages.add_success'))
    clearForm()
    open.value = false
    emit('created')
  } catch (e) {
    const codes = mapApiErrorCodes(e)
    if (Object.keys(codes).length) {
      errors.value = codes
      if (codes.form) toast.error(t(`planning.form.errors.${codes.form}`))
    } else {
      toast.error(t('common_errors.server_error'))
    }
  }
}
</script>

<template>
  <ResponsiveSheet v-model:open="open" :title="drawerTitle">
    <div class="flex flex-col gap-6 py-2">
      <!-- Plan type -->
      <ToggleGroup v-model="toggleType" type="single" variant="outline" class="w-full">
        <ToggleGroupItem value="TRANSACTION" class="flex-1">
          {{ t('planning.form.type.TRANSACTION') }}
        </ToggleGroupItem>
        <ToggleGroupItem value="CATEGORY" class="flex-1">
          {{ t('planning.form.type.CATEGORY') }}
        </ToggleGroupItem>
      </ToggleGroup>

      <!-- Money input -->
      <div>
        <MoneyInput
          v-model:amount="amount"
          v-model:currency="currency"
          :min="0"
          :error="Boolean(errors.amount)"
        />
        <p v-if="errors.amount" class="mt-1 text-xs text-destructive">
          {{ t(`planning.form.errors.${errors.amount}`) }}
        </p>
      </div>

      <!-- Description (one-off only) -->
      <div v-if="type === 'TRANSACTION'">
        <Input
          v-model="description"
          type="text"
          :placeholder="t('planning.form.fields.description.placeholder')"
        />
        <p v-if="errors.description" class="mt-1 text-xs text-destructive">
          {{ t(`planning.form.errors.${errors.description}`) }}
        </p>
      </div>

      <!-- Category picker -->
      <div>
        <CategoryPicker
          v-model="categoryId"
          :categories="availableCategories"
          :error="Boolean(errors.categoryId)"
        />
        <p v-if="errors.categoryId" class="mt-1 text-xs text-destructive">
          {{ t(`planning.form.errors.${errors.categoryId}`) }}
        </p>
      </div>

      <!-- Date pill (one-off only) -->
      <div v-if="type === 'TRANSACTION'">
        <Popover v-model:open="isDateOpen">
          <PopoverTrigger as-child>
            <button
              type="button"
              class="flex w-fit cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition hover:bg-accent"
              :class="errors.date ? 'border-destructive text-destructive' : 'border-border'"
            >
              <IconCalendar class="size-4 shrink-0" />
              <span>{{ datePillLabel }}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0" align="start">
            <Calendar
              v-model="calendarDate"
              :default-placeholder="datePlaceholder"
              :min-value="minDate"
              :max-value="maxDate"
              initial-focus
            />
          </PopoverContent>
        </Popover>
        <p v-if="errors.date" class="mt-1 text-xs text-destructive">
          {{ t(`planning.form.errors.${errors.date}`) }}
        </p>
      </div>

      <!-- Month pill (a plan without a date) -->
      <div v-if="showMonthPill">
        <Popover v-model:open="isMonthOpen">
          <PopoverTrigger as-child>
            <button
              type="button"
              data-testid="plan-month-pill"
              :disabled="monthLocked"
              class="flex w-fit cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-accent disabled:cursor-default disabled:opacity-60 disabled:hover:bg-transparent"
            >
              <IconCalendar class="size-4 shrink-0" />
              <span>{{ monthLabel(month) }}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0" align="start">
            <MonthPicker
              v-model="monthValue"
              :min-value="toMonthValue(monthWindow.min)"
              :max-value="toMonthValue(monthWindow.max)"
              initial-focus
            />
          </PopoverContent>
        </Popover>
      </div>

      <p v-if="lockedByTransaction" class="-mt-4 text-xs text-muted-foreground">
        {{ t('planning.form.fields.month.locked') }}
      </p>

      <!-- Repeat -->
      <label class="flex cursor-pointer items-center gap-3 text-sm">
        <Switch v-model="repeat" />
        {{ t('planning.form.fields.repeat.label') }}
      </label>

      <!-- Submit -->
      <Button class="w-full" :disabled="loading" @click="handleSubmit">
        {{ submitLabel }}
      </Button>
    </div>
  </ResponsiveSheet>
</template>
