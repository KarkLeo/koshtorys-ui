<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ValidationError } from 'yup'
import { toast } from 'vue-sonner'

import { CURRENCIES } from '@/constants/currencies'
import { useMe } from '@/hooks/auth-hooks'
import { useCreateTransaction } from '@/hooks/transaction-hooks'
import { transactionSchema } from '@/validations/transaction'
import {
  applyPlanningToForm,
  buildCreateTransactionDto,
  mapApiErrorCodes,
} from '@/helpers/transaction-form'
import type { PlanningLike } from '@/helpers/transaction-form'

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

// ---------------------------------------------------------------------------
// Props / emits
// ---------------------------------------------------------------------------

const props = defineProps<{ mode: 'add' | 'edit' }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ created: [] }>()

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

const { user } = useMe()
const { createTransaction, loading } = useCreateTransaction()
const { t } = useI18n()

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

/** Максимум — сегодня (запрет будущих дат, дублирует yup date_max). */
const maxDate = computed<DateValue>(() => today(getLocalTimeZone()))

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
  if (props.mode !== 'add') return
  if (!(await validateForm())) return
  try {
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
 * SelectPlanningModal emits the full Planning GraphQL object on submit.
 * Shape relevant to PlanningLike:
 *   amount: number, currency: string, description?: string | null,
 *   categoryId: string, date?: DateTime | null (ISO string from GraphQL).
 */
const onPlanningSubmit = (plan?: {
  amount?: number
  currency?: string
  description?: string | null
  categoryId?: string
  date?: string | null
  id?: string
}) => {
  if (plan) {
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
    date.value = next.date
  }
  isPlanningOpen.value = false
}

const onPlanningClose = () => {
  isPlanningOpen.value = false
}

const onPlanningCardClick = () => {
  if (selectedPlanning.value) {
    selectedPlanning.value = null
  } else {
    isPlanningOpen.value = true
  }
}
</script>

<template>
  <ResponsiveSheet v-model:open="open" :title="t('transaction.form.title')">
    <div class="flex flex-col gap-6 py-2">
      <!-- Date pill -->
      <div>
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
            <Calendar v-model="calendarDate" :max-value="maxDate" initial-focus />
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
        {{ t('transaction.form.buttons.add') }}
      </Button>
    </div>
  </ResponsiveSheet>

  <!-- Planning modal — mounted only when open -->
  <SelectPlanningModal
    v-if="isPlanningOpen"
    v-model="selectedPlanning"
    @close="onPlanningClose"
    @submit="onPlanningSubmit"
  />
</template>
