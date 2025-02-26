<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ValidationError } from 'yup'

import type { PlanningType } from '@/graphql/types.ts'
import { CURRENCIES } from '@/constants/currencies.ts'
import { useToastStore } from '@/stores/toastStore.ts'
import { useMe } from '@/hooks/auth-hooks.ts'
import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'
import { useCreatePlanning, usePlanningList } from '@/hooks/planning-hooks.ts'
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

// ===== Hooks =====

const { t } = useI18n()
const { me } = useMe()
const toastStore = useToastStore()
const { createPlanning } = useCreatePlanning()
const { statisticDate } = useStatisticDateStore()
const { planning } = usePlanningList()

// ===== Refs =====

const type = ref<PlanningType>('TRANSACTION' as PlanningType)
const amount = ref('0')
const currency = ref(me.value?.me.currency || CURRENCIES[0])
const description = ref('')
const date = ref<Date | null>()
const categoryId = ref('')
const repeat = ref(false)

const errors = ref<Record<string, string>>({})

// ===== Computed =====

const currentPeriod = computed(() => {
  return getMonthPeriod(me.value?.me?.monthStartDay, statisticDate.value)
})

// ===== Handler and utils =====

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
        date: date.value?.toISOString(),
        repeat: repeat.value,
      },
      { abortEarly: false },
    )
    errors.value = {}
    return true
    // eslint-disable-next-line
  } catch (validationErrors: any) {
    console.log('validationErrors', validationErrors)
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
  currency.value = me.value?.me.currency || CURRENCIES[0]
  description.value = ''
  categoryId.value = ''
  date.value = null
  repeat.value = false
  errors.value = {}
}

const handlerCreatePlanning = async () => {
  try {
    const isValid = await validateForm()
    if (!isValid) return

    await createPlanning({
      planningData: {
        type: type.value,
        amount: parseFloat(amount.value),
        currency: currency.value,
        description: description.value,
        categoryId: categoryId.value,
        date: date.value?.toISOString(),
        monthIndex: getMonthIndex(statisticDate.value, me.value?.me.monthStartDay),
        year: getIndexedYear(statisticDate.value, me.value?.me.monthStartDay),
        repeat: repeat.value,
      },
    })
    clearForm()
    toastStore.success(t(`planning.form.messages.create_success`))
    // eslint-disable-next-line
  } catch (e: any) {
    try {
      const errorCodes = e.cause.extensions.originalError.errorCodes
      if (errorCodes) {
        errors.value = errorCodes
      }
      if (errorCodes.form) {
        toastStore.error(t(`planning.form.errors.${errorCodes.form}`))
      }
      // eslint-disable-next-line
    } catch (e: any) {
      toastStore.error(t('common_errors.server_error'))
    }
  }
}

const filterCategories = (categories: string[]): string[] => {
  if (type.value === 'CATEGORY') {
    if (!planning.value?.planning) {
      return categories
    }

    const usedCategories = planning.value.planning
      .filter((plan) => plan.type === 'CATEGORY')
      .map((plan) => plan.categoryId)

    return categories.filter((category) => !usedCategories.includes(category))
  } else {
    return categories
  }
}
</script>

<template>
  <div class="planning-from">
    <div class="planning-form-header">
      <KitToggleBar
        v-model="type"
        :options="['TRANSACTION', 'CATEGORY']"
        :get-option-label="getPlanningLabel"
      />
      <div class="planning-form-buttons">
        <KitButton size="md" variant="secondary-gray" @click="clearForm">
          {{ $t('planning.form.buttons.cancel') }}</KitButton
        >
        <KitButton size="md" @click="handlerCreatePlanning">{{
          $t('planning.form.buttons.add')
        }}</KitButton>
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
  padding: var(--spacing-xl);

  border: 1px solid var(--border-primary);
  border-radius: var(--radius-2xl);
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
