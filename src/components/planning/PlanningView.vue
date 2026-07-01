<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import MonthSwitcher from '@/components/MonthSwitcher.vue'
import PlanningStats from '@/components/planning/PlanningStats.vue'
import PlanCategoryGroup from '@/components/planning/PlanCategoryGroup.vue'
import PlanningAddForm from '@/components/planning/PlanningAddForm.vue'
import PlanningEditForm from '@/components/planning/PlanningEditForm.vue'
import { Skeleton } from '@/components/ui/skeleton'

import { usePlanningMapperRest } from '@/mappers/planning-rest-mapper'
import { useDeletePlanning } from '@/hooks/planning-hooks'
import { useStatisticDateStore } from '@/stores/statisticDateStore'
import { useMe } from '@/hooks/auth-hooks'
import { CURRENCIES_SYMBOL } from '@/constants/currencies'
import { PlanningType } from '@/graphql/types'

// ===== Hooks =====

const { t } = useI18n()
const { statisticDate } = useStatisticDateStore()
const { user } = useMe()
const { planningTables, repeatingPlanningTables, planningStatistics, loading, invalidate } =
  usePlanningMapperRest()
const { deletePlanning } = useDeletePlanning()

// ===== Refs =====

const editingId = ref<string | null>(null)

// ===== Computed =====

const currency = computed(() => CURRENCIES_SYMBOL[user.value?.currency || ''] || user.value?.currency || '')

// `PlanningEditForm` is still Kit+Apollo and expects the GraphQL `Planning` shape
// (notably `id: string` and a `PlanningType` enum), while our REST DTO uses
// `id: number` and a plain string-literal union for `type`. Build a small,
// explicit adapter for the plan currently being edited instead of forcing the
// REST DTO through as-is.
const editingPlan = computed(() => {
  if (!editingId.value) return null
  const original = [...planningTables.value, ...repeatingPlanningTables.value]
    .flatMap((group) => group.items)
    .find((plan) => plan.id === editingId.value)?.original
  if (!original) return null
  return {
    id: String(original.id),
    amount: original.amount,
    currency: original.currency,
    date: original.date,
    description: original.description,
    categoryId: original.categoryId,
    repeat: original.repeat,
    type: original.type as PlanningType,
    year: original.year,
    monthIndex: original.monthIndex,
    repeatedPlanningId: original.repeatedPlanningId,
    parentPlanningId: original.parentPlanningId,
    transactions: null,
  }
})

// ===== Handlers =====

const handleDelete = async (id: string) => {
  try {
    await deletePlanning({ planningId: Number(id) })
    toast.success(t('planning.form.messages.delete_success'))
    invalidate()
    // eslint-disable-next-line
  } catch (e: any) {
    toast.error(t('common_errors.server_error'))
  }
}

const handleEdit = (id: string) => {
  editingId.value = id
}

const handleCloseEditForm = () => {
  editingId.value = null
  invalidate()
}
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <MonthSwitcher v-model="statisticDate" :month-start-day="user?.monthStartDay ?? 1" />

    <template v-if="loading">
      <Skeleton class="h-24 w-full" />
      <Skeleton class="h-48 w-full" />
    </template>

    <template v-else>
      <p v-if="planningTables.length === 0" class="py-6 text-center text-sm italic text-muted-foreground">
        {{ t('planning.table.empty') }}
      </p>

      <PlanningStats v-if="planningStatistics" :stats="planningStatistics" :currency="currency" />

      <template v-for="group in planningTables" :key="group.category">
        <PlanningEditForm
          v-if="editingId && group.items.some((plan) => plan.id === editingId) && editingPlan"
          :planning="editingPlan"
          @close-form="handleCloseEditForm"
        />
        <PlanCategoryGroup
          v-else
          :group="group"
          :currency="currency"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </template>
    </template>

    <PlanningAddForm />

    <div
      v-for="group in repeatingPlanningTables"
      :key="'repeating-' + group.category"
      class="opacity-50"
    >
      <PlanCategoryGroup :group="group" :currency="currency" @edit="() => {}" @delete="() => {}" />
    </div>
  </div>
</template>
