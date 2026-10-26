<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ValidationError } from 'yup'
import { toast } from 'vue-sonner'

import { CURRENCIES } from '@/constants/currencies'
import { useMe } from '@/hooks/auth-hooks'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/transaction-hooks'
import { transactionSchema } from '@/validations/transaction'
import {
  applyPlanningToForm,
  buildCreateTransactionDto,
  buildUpdateTransactionDto,
  clampToBounds,
  transactionDateBounds,
} from '@/helpers/transaction-form'
import { getIndexedYear, getMonthIndex, getStartMonthDate } from '@/helpers/date'
import { mapApiErrorCodes } from '@/helpers/api-errors'
import type { PlanMonth, PlanningLike } from '@/helpers/transaction-form'
import type { DisplayTransaction } from '@/components/transaction/types'

import { CalendarDate, getLocalTimeZone, today, type DateValue } from '@internationalized/date'

import { ResponsiveSheet } from '@/components/ui/responsive-sheet'
import { MoneyInput } from '@/components/ui/money-input'
import { CategoryPicker } from '@/components/ui/category-picker'
import { ActionCard } from '@/components/ui/action-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import IconLink from '@/components/icons/IconLink.vue'
import IconSlashCircle from '@/components/icons/IconSlashCircle.vue'
import SelectPlanningModal from '@/components/transaction/SelectPlanningModal.vue'
import SelectedPlanCard from '@/components/transaction/SelectedPlanCard.vue'

// ---------------------------------------------------------------------------
// Props / emits
// ---------------------------------------------------------------------------

const props = defineProps<{ mode: 'add' | 'edit'; transaction?: DisplayTransaction }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ created: []; updated: [] }>()

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

const { user } = useMe()
const { createTransaction, loading: createLoading } = useCreateTransaction()
const { updateTransaction, loading: updateLoading } = useUpdateTransaction()
const { t } = useI18n()

/** Общий busy-флаг для disable submit-кнопки (add и edit используют разные хуки). */
const loading = computed(() => createLoading.value || updateLoading.value)

const drawerTitle = computed(() =>
  props.mode === 'edit' ? t('transaction.form.edit_title') : t('transaction.form.title'),
)
const submitLabel = computed(() =>
  props.mode === 'edit' ? t('transaction.form.buttons.update') : t('transaction.form.buttons.add'),
)

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

const amount = ref('')
const currency = ref(user.value?.currency || CURRENCIES[0])
const description = ref('')
const date = ref<Date>(new Date())
const categoryId = ref('')
const selectedPlanning = ref<string | null>(null)
const isPlanningOpen = ref(false)
const errors = ref<Record<string, string>>({})

/** Сводка выбранного плана для блока в форме (название/категория/сумма). */
interface SelectedPlan {
  description: string
  categoryId: string
  amount: number
  currency: string
}
const selectedPlan = ref<SelectedPlan | null>(null)

/** Financial month of the linked plan; the transaction's date has to stay inside it. */
const planMonth = ref<PlanMonth | null>(null)

// Когда привязка снимается (cancel в модалке, clearForm, «×» в блоке) — чистим и сводку.
watch(selectedPlanning, (val) => {
  if (!val) {
    selectedPlan.value = null
    planMonth.value = null
  }
})

/**
 * Предзаполнение формы существующей транзакцией (edit-режим).
 * originalAmount/originalCurrency берутся, если транзакция была в валюте, отличной
 * от валюты пользователя (иначе редактировали бы конвертированную сумму).
 */
const fillFromTransaction = (tx: DisplayTransaction) => {
  amount.value = String(tx.originalAmount ?? tx.amount)
  currency.value = tx.originalCurrency || tx.currency || user.value?.currency || CURRENCIES[0]
  description.value = tx.description || ''
  date.value = new Date(tx.date)
  categoryId.value = tx.categoryId || ''
  selectedPlanning.value = tx.planningId ? String(tx.planningId) : null
  // The linked plan itself isn't loaded here; a linked transaction sits in its plan's month.
  const monthStartDay = user.value?.monthStartDay ?? 1
  planMonth.value = tx.planningId
    ? {
        monthIndex: getMonthIndex(date.value, monthStartDay),
        year: getIndexedYear(date.value, monthStartDay),
      }
    : null
  errors.value = {}
}

// В edit-режиме заполняем сразу и при смене выбранной транзакции.
if (props.mode === 'edit' && props.transaction) fillFromTransaction(props.transaction)
watch(
  () => props.transaction,
  (tx) => {
    if (props.mode === 'edit' && tx) fillFromTransaction(tx)
  },
)

// ---------------------------------------------------------------------------
// Date picker (shadcn Popover + Calendar; мост Date <-> CalendarDate)
// ---------------------------------------------------------------------------

const isDateOpen = ref(false)

/** Reka-ui Calendar работает с DateValue (CalendarDate), форма хранит нативный Date. */
const calendarDate = computed<DateValue>({
  get() {
    const d = date.value
    return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
  },
  set(value) {
    if (value) {
      date.value = value.toDate(getLocalTimeZone())
      isDateOpen.value = false
    }
  },
})

const toDateValue = (d: Date) => new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())

/**
 * Up to today (mirrors yup date_max), no further back than the last 12 financial months, and
 * inside the linked plan's month when there is one. A transaction already older than that keeps
 * its date: it shows, but no other old day can be picked — the API rejects a changed old date.
 */
const dateBounds = computed(() =>
  transactionDateBounds(planMonth.value, user.value?.monthStartDay ?? 1, new Date()),
)
const minDate = computed<DateValue | undefined>(() =>
  dateBounds.value ? toDateValue(dateBounds.value.min) : undefined,
)
const maxDate = computed<DateValue>(() =>
  dateBounds.value ? toDateValue(dateBounds.value.max) : today(getLocalTimeZone()),
)

/** Human-readable date label for the pill button */
const datePillLabel = computed(() => {
  return date.value.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const clearForm = () => {
  amount.value = ''
  description.value = ''
  categoryId.value = ''
  date.value = new Date()
  currency.value = user.value?.currency || CURRENCIES[0]
  selectedPlanning.value = null
  errors.value = {}
}

const validateForm = async (): Promise<boolean> => {
  try {
    await transactionSchema.validate(
      {
        amount: parseFloat(amount.value || '0'),
        currency: currency.value,
        description: description.value,
        categoryId: categoryId.value,
        date: date.value.toISOString(),
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

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

const handleSubmit = async () => {
  if (!(await validateForm())) return
  try {
    if (props.mode === 'edit') {
      if (!props.transaction) return
      await updateTransaction(
        Number(props.transaction.id),
        buildUpdateTransactionDto({
          amount: amount.value,
          currency: currency.value,
          description: description.value,
          categoryId: categoryId.value,
          date: date.value,
          planningId: selectedPlanning.value,
        }),
      )
      toast.success(t('transaction.form.messages.update_success'))
      open.value = false
      emit('updated')
      return
    }

    await createTransaction(
      buildCreateTransactionDto({
        amount: amount.value,
        currency: currency.value,
        description: description.value,
        categoryId: categoryId.value,
        date: date.value,
        planningId: selectedPlanning.value,
      }),
    )
    toast.success(t('transaction.form.messages.add_success'))
    clearForm()
    open.value = false
    emit('created')
  } catch (e) {
    const codes = mapApiErrorCodes(e)
    if (Object.keys(codes).length) {
      errors.value = codes
      if (codes.form) toast.error(t(`transaction.form.errors.${codes.form}`))
    } else {
      toast.error(t('common_errors.server_error'))
    }
  }
}

/**
 * SelectPlanningModal emits the REST `PlanResponseDto` on submit.
 * Shape relevant to PlanningLike:
 *   amount: number, currency: string, description?: string | null,
 *   categoryId: string, date?: string | null (ISO date string from REST).
 */
const onPlanningSubmit = (plan?: {
  amount?: number
  currency?: string
  description?: string | null
  categoryId?: string
  date?: string | null
  id?: number
  monthIndex?: number
  year?: number
}) => {
  if (plan) {
    const month =
      plan.monthIndex != null && plan.year != null
        ? { monthIndex: plan.monthIndex, year: plan.year }
        : null
    const monthStartDay = user.value?.monthStartDay ?? 1
    const bounds = transactionDateBounds(month, monthStartDay, new Date())
    if (!bounds) {
      // No transaction date can fall in a month that hasn't started, or that is older than the
      // window: keep the previous link.
      const planStart = month && getStartMonthDate(month.year, month.monthIndex, monthStartDay)
      toast.error(
        t(
          planStart && planStart > new Date()
            ? 'transaction.form.errors.plan_month_not_started'
            : 'transaction.form.errors.plan_month_too_old',
        ),
      )
      selectedPlanning.value = planningBeforePicker.value
      isPlanningOpen.value = false
      return
    }

    const planningLike: PlanningLike = {
      amount: plan.amount,
      currency: plan.currency,
      description: plan.description ?? undefined,
      categoryId: plan.categoryId,
      date: plan.date ?? null,
    }
    const next = applyPlanningToForm(
      {
        amount: amount.value,
        currency: currency.value,
        description: description.value,
        categoryId: categoryId.value,
        date: date.value,
      },
      planningLike,
      user.value?.currency || CURRENCIES[0],
    )
    amount.value = next.amount
    currency.value = next.currency
    description.value = next.description
    categoryId.value = next.categoryId
    // applyPlanningToForm keeps a filled-in form as is, date included, so the date is moved
    // into the plan's month separately.
    date.value = clampToBounds(next.date, bounds)
    planMonth.value = month

    // Сохраняем сводку для блока выбранного плана.
    selectedPlan.value = {
      description: plan.description ?? '',
      categoryId: plan.categoryId ?? '',
      amount: plan.amount ?? 0,
      currency: plan.currency ?? (user.value?.currency || CURRENCIES[0]),
    }
  }
  isPlanningOpen.value = false
}

/** The link as it was when the picker opened, restored if the picker closes without a choice. */
const planningBeforePicker = ref<string | null>(null)

const onPlanningClose = () => {
  // The picker's own "unlink" clears the selection before closing; that one stays cleared.
  if (selectedPlanning.value !== null) selectedPlanning.value = planningBeforePicker.value
  isPlanningOpen.value = false
}

/** Карточка «Планування» всегда открывает выбор (сменить план); отвязка — через «×» в блоке. */
const onPlanningCardClick = () => {
  planningBeforePicker.value = selectedPlanning.value
  isPlanningOpen.value = true
}

const clearPlanning = () => {
  selectedPlanning.value = null // watch очистит selectedPlan
}
</script>

<template>
  <ResponsiveSheet v-model:open="open" :title="drawerTitle">
    <div class="flex flex-col gap-6 py-2">
      <!-- Date pill -->
      <div>
        <Popover v-model:open="isDateOpen">
          <PopoverTrigger as-child>
            <button
              type="button"
              :disabled="!dateBounds"
              class="flex w-fit cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              :class="errors.date ? 'border-destructive text-destructive' : 'border-border'"
            >
              <IconCalendar class="size-4 shrink-0" />
              <span>{{ datePillLabel }}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0" align="start">
            <Calendar
              v-model="calendarDate"
              :min-value="minDate"
              :max-value="maxDate"
              initial-focus
            />
          </PopoverContent>
        </Popover>
        <p v-if="errors.date" class="mt-1 text-xs text-destructive">
          {{ t(`transaction.form.errors.${errors.date}`) }}
        </p>
      </div>

      <!-- Money input -->
      <div>
        <MoneyInput
          v-model:amount="amount"
          v-model:currency="currency"
          :min="0"
          :error="Boolean(errors.amount)"
        />
        <p v-if="errors.amount" class="mt-1 text-xs text-destructive">
          {{ t(`transaction.form.errors.${errors.amount}`) }}
        </p>
      </div>

      <!-- Description -->
      <Input
        v-model="description"
        type="text"
        :placeholder="t('transaction.form.fields.description.placeholder')"
      />

      <!-- Category picker -->
      <div>
        <CategoryPicker v-model="categoryId" :error="Boolean(errors.categoryId)" />
        <p v-if="errors.categoryId" class="mt-1 text-xs text-destructive">
          {{ t(`transaction.form.errors.${errors.categoryId}`) }}
        </p>
      </div>

      <!-- Selected plan block (2.5) -->
      <SelectedPlanCard v-if="selectedPlan" :plan="selectedPlan" @unlink="clearPlanning" />

      <!-- Action cards grid -->
      <div class="grid grid-cols-2 gap-3">
        <ActionCard
          :label="t('transaction.form.actions.planning')"
          :class="selectedPlanning ? 'border-primary' : ''"
          @click="onPlanningCardClick"
        >
          <template #icon>
            <IconLink class="size-5" />
          </template>
        </ActionCard>

        <ActionCard :label="t('transaction.form.actions.scan')" disabled>
          <template #icon>
            <IconSlashCircle class="size-5" />
          </template>
        </ActionCard>
      </div>

      <!-- Submit button -->
      <Button class="w-full" :disabled="loading" @click="handleSubmit">
        {{ submitLabel }}
      </Button>
    </div>
  </ResponsiveSheet>

  <!-- Planning modal — mounted only when open -->
  <SelectPlanningModal
    v-if="isPlanningOpen"
    v-model="selectedPlanning"
    :old-planning-id="transaction?.planningId != null ? String(transaction.planningId) : null"
    @close="onPlanningClose"
    @submit="onPlanningSubmit"
  />
</template>
