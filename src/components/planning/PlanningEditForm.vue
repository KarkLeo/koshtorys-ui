<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ValidationError } from 'yup'

import type { PlanningQuery, PlanningType } from '@/graphql/types.ts'
import { CURRENCIES } from '@/constants/currencies.ts'
import { toast } from 'vue-sonner'
import { useMe } from '@/hooks/auth-hooks.ts'
import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'
import { usePlanningList, useUpdatePlanning } from '@/hooks/planning-hooks.ts'
import { getIndexedYear, getMonthIndex, getMonthPeriod } from '@/helpers/date.ts'
import { planSchema } from '@/validations/plan.ts'

import KitToggleBar from '@/components/kit/KitToggleBar.vue'
import KitMoneyInput from '@/components/kit/KitMoneyInput.vue'
import KitInput from '@/components/kit/KitInput.vue'
import KitCategories from '@/components/kit/KitCategories.vue'
import KitDatePicker from '@/components/kit/KitDatePicker.vue'
import KitButton from '@/components/kit/KitButton.vue'
import KitToggle from '@/components/kit/KitToggle.vue'
import KitSimpleFieldWrapper from '@/components/kit/KitSimpleFieldWrapper.vue'
import KitPreloader from '@/components/kit/KitPreloader.vue'

// ===== Types =====

type BasePlanning = PlanningQuery['planning'][number]

// ===== Emits and Props =====

const emit = defineEmits(['closeForm'])
const { planning } = defineProps<{
  planning: BasePlanning
}>()

// ===== Hooks =====

const { t } = useI18n()
const { user } = useMe()
const { updatePlanning, loading } = useUpdatePlanning()
const { statisticDate } = useStatisticDateStore()
const { planning: planningList } = usePlanningList()

// ===== Refs =====

const type = ref<PlanningType>(planning.type as PlanningType)
const amount = ref(String(planning.amount))
const currency = ref(planning.currency || user.value?.currency || CURRENCIES[0])
const description = ref(planning.description || '')
const date = ref<Date | null>(planning.date ? new Date(planning.date) : null)
const categoryId = ref(planning.categoryId || '')
const repeat = ref(planning.repeat || false)

const errors = ref<Record<string, string>>({})

// ===== Watchers =====

watch(
  () => planning,
  (newPlanning) => {
    type.value = newPlanning.type as PlanningType
    amount.value = String(newPlanning.amount)
    currency.value = newPlanning.currency || user.value?.currency || CURRENCIES[0]
    description.value = newPlanning.description || ''
    date.value = newPlanning.date ? new Date(newPlanning.date) : null
    categoryId.value = newPlanning.categoryId || ''
    repeat.value = newPlanning.repeat || false
  },
)

// ===== Computed =====

const currentPeriod = computed(() => {
  return getMonthPeriod(user.value?.monthStartDay, statisticDate.value)
})

// ===== Handlers and utils =====

const getPlanningLabel = (type: string) => t(`planning.form.type.${type}`)

const validateForm = async () => {
  try {
    await planSchema.validate(
      {
        type: type.value,
        amount: parseFloat(amount.value || '0'),
        currency: currency.value,
        description: description.value,
        categoryId: categoryId.value,
        date: date.value?.toISOString() || null,
        repeat: repeat.value,
      },
      { abortEarly: false },
    )
    errors.value = {}
    return true
    // eslint-disable-next-line
  } catch (validationErrors: any) {
    errors.value = (validationErrors as ValidationError).inner.reduce(
      // eslint-disable-next-line
      (acc: Record<string, string>, error: any) => {
        if (!acc[error.path]) acc[error.path] = error.message
        return acc
      },
      {},
    )
    return false
  }
}

const clearForm = () => {
  amount.value = ''
  currency.value = user.value?.currency || CURRENCIES[0]
  description.value = ''
  categoryId.value = ''
  date.value = statisticDate.value
  repeat.value = false
  errors.value = {}
}

const handlerUpdatePlanning = async () => {
  try {
    const isValid = await validateForm()
    if (!isValid) return

    await updatePlanning({
      planningId: Number(planning.id),
      planningData: {
        type: type.value,
        amount: parseFloat(amount.value),
        currency: currency.value,
        description: description.value,
        categoryId: categoryId.value,
        date: date.value?.toISOString(),
        monthIndex: getMonthIndex(statisticDate.value, user.value?.monthStartDay),
        year: getIndexedYear(statisticDate.value, user.value?.monthStartDay),
        repeat: repeat.value,
      },
    })
    clearForm()
    toast.success(t(`planning.form.messages.update_success`))
    emit('closeForm')
    // eslint-disable-next-line
  } catch (e: any) {
    try {
      const errorCodes = e.cause.extensions.originalError.errorCodes
      if (errorCodes) {
        errors.value = errorCodes
      }
      if (errorCodes.form) {
        toast.error(t(`planning.form.errors.${errorCodes.form}`))
      }
      // eslint-disable-next-line
    } catch (e: any) {
      toast.error(t('common_errors.server_error'))
    }
  }
}

const handleCloseForm = () => {
  clearForm()
  emit('closeForm')
}

const filterCategories = (categories: string[]): string[] => {
  if (type.value === 'CATEGORY') {
    if (!planningList.value?.planning) {
      return categories
    }

    const usedCategories = planningList.value.planning
      .filter((plan) => plan.type === 'CATEGORY')
      .map((plan) => plan.categoryId)

    return categories.filter(
      (category) => !usedCategories.includes(category) || category === planning.categoryId,
    )
  } else {
    return categories
  }
}
</script>

<template>
  <div class="planning-from">
    <div :class="['planning-from-preloader', { loading: loading }]">
      <KitPreloader size="md" />
    </div>

    <div class="planning-form-header">
      <KitToggleBar
        v-model="type"
        :options="['TRANSACTION', 'CATEGORY']"
        :get-option-label="getPlanningLabel"
      />
      <div class="planning-form-buttons">
        <KitButton size="md" variant="secondary-gray" @click="handleCloseForm">
          {{ $t('planning.form.buttons.cancel') }}
        </KitButton>
        <KitButton size="md" @click="handlerUpdatePlanning">
          {{ $t('planning.form.buttons.update') }}
        </KitButton>
      </div>
    </div>
    <div class="planning-from-fields" v-if="type === 'CATEGORY'">
      <KitSimpleFieldWrapper
        :error="Boolean(errors?.categoryId)"
        :message="errors?.categoryId ? $t(`planning.form.errors.${errors.categoryId}`) : ''"
      >
        <KitCategories
          v-model="categoryId"
          @click.stop
          :error="Boolean(errors?.categoryId)"
          :filter-options="filterCategories"
        />
      </KitSimpleFieldWrapper>
      <label class="planing-form-toggle">
        <KitToggle v-model="repeat" label="Repeat" />
        {{ $t('planning.form.fields.repeat.label') }}
      </label>
      <div class="planing-form-amount">
        <KitSimpleFieldWrapper
          :error="Boolean(errors?.amount)"
          :message="errors?.amount ? $t(`planning.form.errors.${errors.amount}`) : ''"
        >
          <KitMoneyInput
            v-model="amount"
            v-model:currency="currency"
            :placeholder="$t('planning.form.fields.amount.placeholder') + ': 0.00'"
            :min="0"
            :error="Boolean(errors?.amount)"
          />
        </KitSimpleFieldWrapper>
      </div>
    </div>
    <div class="planning-from-fields" v-else>
      <div class="planning-from-fields-group">
        <KitSimpleFieldWrapper
          :error="Boolean(errors?.description)"
          :message="errors?.description ? $t(`planning.form.errors.${errors.description}`) : ''"
        >
          <KitInput
            v-model="description"
            type="text"
            :placeholder="$t('planning.form.fields.description.placeholder')"
            :error="Boolean(errors?.description)"
          />
        </KitSimpleFieldWrapper>
        <KitSimpleFieldWrapper
          :error="Boolean(errors?.categoryId)"
          :message="errors?.categoryId ? $t(`planning.form.errors.${errors.categoryId}`) : ''"
        >
          <KitCategories
            v-model="categoryId"
            @click.stop
            class="planing-form-category"
            :error="Boolean(errors?.categoryId)"
          />
        </KitSimpleFieldWrapper>
      </div>
      <div class="planning-from-fields-group">
        <KitSimpleFieldWrapper
          :error="Boolean(errors?.date)"
          :message="errors?.date ? $t(`planning.form.errors.${errors.date}`) : ''"
        >
          <KitDatePicker
            class="planing-form-date"
            v-model="date"
            full-width
            @click.stop
            size="xl"
            :min-date="currentPeriod[0]"
            :max-date="currentPeriod[1]"
            :error="Boolean(errors?.date)"
          />
        </KitSimpleFieldWrapper>
        <label class="planing-form-toggle">
          <KitToggle v-model="repeat" label="Repeat" />
          {{ $t('planning.form.fields.repeat.label') }}
        </label>
      </div>
      <div class="planing-form-amount">
        <KitSimpleFieldWrapper
          :error="Boolean(errors?.amount)"
          :message="errors?.amount ? $t(`planning.form.errors.${errors.amount}`) : ''"
        >
          <KitMoneyInput
            v-model="amount"
            v-model:currency="currency"
            :placeholder="$t('planning.form.fields.amount.placeholder') + ': 0.00'"
            :min="0"
            :error="Boolean(errors?.amount)"
          />
        </KitSimpleFieldWrapper>
      </div>
    </div>
  </div>
</template>
<style scoped>
.planning-from {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-3xl);
}

.planning-from-preloader {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;

  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: rgba(12, 17, 29, 0.6);
  backdrop-filter: blur(2px);
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease-in-out;
}

.loading {
  opacity: 1;
  pointer-events: auto;
}

.planning-form-header {
  display: flex;
  flex-direction: column-reverse;
  width: 100%;
  gap: var(--spacing-xl);
}

.planning-form-buttons {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.planning-from-fields {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
}

.planing-form-amount {
  grid-column: 3 / 4;
}

.planing-form-category {
  flex-shrink: 0;
  flex-grow: 0;
}

.planing-form-date {
  height: 46px;
}

.planning-from-fields-group {
  flex-grow: 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.planing-form-toggle {
  width: 100%;
  height: 42px;
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
  box-sizing: border-box;

  cursor: pointer;
  user-select: none;
}

@media screen and (min-width: 768px) {
  .planning-form-header {
    flex-direction: row;
    justify-content: space-between;
  }

  .planning-form-buttons {
    justify-content: flex-end;
  }

  .planning-from-fields {
    display: grid;
    grid-template-columns: 5fr 4fr 3fr;
  }
}
</style>
