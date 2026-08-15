<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import MonthSwitcher from '@/components/MonthSwitcher.vue'
import PlanningStats from '@/components/planning/PlanningStats.vue'
import PlanCategoryGroup from '@/components/planning/PlanCategoryGroup.vue'
import PlanFormDrawer from '@/components/planning/PlanFormDrawer.vue'
import RepeatingPlanSuggestions from '@/components/planning/RepeatingPlanSuggestions.vue'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { usePlanningMapperRest } from '@/mappers/planning-rest-mapper'
import { useDeletePlan, useRepeatPlan, useCancelRepeatPlan } from '@/hooks/planning-write-hooks'
import { mapApiErrorCodes } from '@/helpers/api-errors'
import { useStatisticDateStore } from '@/stores/statisticDateStore'
import { useMe } from '@/hooks/auth-hooks'
import { CURRENCIES_SYMBOL } from '@/constants/currencies'

// ===== Hooks =====

const { t } = useI18n()
const { statisticDate } = useStatisticDateStore()
const { user } = useMe()
const { planningTables, repeatingPlanningTables, planningStatistics, loading } =
  usePlanningMapperRest()
const { deletePlan, loading: deleteLoading } = useDeletePlan()
const { repeatPlan } = useRepeatPlan()
const { cancelRepeatPlan } = useCancelRepeatPlan()

// ===== Refs =====

const editingId = ref<string | null>(null)
// deletingId держим ОТДЕЛЬНО от confirmOpen: AlertDialogAction синхронно закрывает
// диалог до пользовательского @click, и id в open-состоянии успел бы сброситься.
const deletingId = ref<string | null>(null)
const confirmOpen = ref(false)
const busySuggestionId = ref<string | null>(null)

// ===== Computed =====

const currency = computed(
  () => CURRENCIES_SYMBOL[user.value?.currency || ''] || user.value?.currency || '',
)

const allPlans = computed(() => planningTables.value.flatMap((group) => group.items))

const editingPlan = computed(
  () => allPlans.value.find((plan) => plan.id === editingId.value)?.original,
)

const editOpen = computed({
  get: () => editingId.value !== null,
  set: (open: boolean) => {
    if (!open) editingId.value = null
  },
})

// ===== Handlers =====

const handleEdit = (id: string) => {
  editingId.value = id
}

const handleDelete = (id: string) => {
  deletingId.value = id
  confirmOpen.value = true
}

const confirmDelete = async () => {
  const id = deletingId.value
  if (id === null) return
  try {
    await deletePlan(Number(id))
    toast.success(t('planning.form.messages.delete_success'))
  } catch (e) {
    const codes = mapApiErrorCodes(e)
    toast.error(
      codes.form ? t(`planning.form.errors.${codes.form}`) : t('common_errors.server_error'),
    )
  } finally {
    deletingId.value = null
    confirmOpen.value = false
  }
}

const handleRepeat = async (id: string) => {
  busySuggestionId.value = id
  try {
    await repeatPlan(Number(id))
    toast.success(t('planning.form.messages.repeat_success'))
  } catch (e) {
    const codes = mapApiErrorCodes(e)
    toast.error(
      codes.form ? t(`planning.form.errors.${codes.form}`) : t('common_errors.server_error'),
    )
  } finally {
    busySuggestionId.value = null
  }
}

const handleCancelRepeat = async (id: string) => {
  busySuggestionId.value = id
  try {
    await cancelRepeatPlan(Number(id))
    toast.success(t('planning.form.messages.cansel_repeat_success'))
  } catch (e) {
    const codes = mapApiErrorCodes(e)
    toast.error(
      codes.form ? t(`planning.form.errors.${codes.form}`) : t('common_errors.server_error'),
    )
  } finally {
    busySuggestionId.value = null
  }
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
      <PlanningStats v-if="planningStatistics" :stats="planningStatistics" :currency="currency" />

      <p
        v-if="planningTables.length === 0"
        class="py-6 text-center text-sm italic text-muted-foreground"
      >
        {{ t('planning.table.empty') }}
      </p>

      <PlanCategoryGroup
        v-for="group in planningTables"
        :key="group.category"
        :group="group"
        :currency="currency"
        @edit="handleEdit"
        @delete="handleDelete"
      />

      <RepeatingPlanSuggestions
        :groups="repeatingPlanningTables"
        :currency="currency"
        :busy-id="busySuggestionId"
        @repeat="handleRepeat"
        @cancel-repeat="handleCancelRepeat"
      />
    </template>
  </div>

  <PlanFormDrawer v-model:open="editOpen" mode="edit" :plan="editingPlan" />

  <AlertDialog v-model:open="confirmOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ t('planning.delete_confirm.title') }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ t('planning.delete_confirm.description') }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="deleteLoading">
          {{ t('planning.delete_confirm.cancel') }}
        </AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-white hover:bg-destructive/90"
          :disabled="deleteLoading"
          @click="confirmDelete"
        >
          {{ t('planning.delete_confirm.confirm') }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
