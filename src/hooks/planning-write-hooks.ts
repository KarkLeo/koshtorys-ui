import { ref } from 'vue'
import { planningApi } from '@/api/services/planning.service'
import { invalidatePlanning } from '@/hooks/planning-rest-hooks'
import { useStatisticDateStore } from '@/stores/statisticDateStore'
import { useMe } from '@/hooks/auth-hooks'
import { getMonthIndex, getIndexedYear } from '@/helpers/date'
import type { CreatePlanDto, UpdatePlanDto } from '@/helpers/plan-form'

export function useCreatePlan() {
  const loading = ref(false)

  const createPlan = async (dto: CreatePlanDto) => {
    loading.value = true
    try {
      const created = await planningApi.create(dto)
      await invalidatePlanning()
      return created
    } finally {
      loading.value = false
    }
  }

  return { createPlan, loading }
}

export function useUpdatePlan() {
  const loading = ref(false)

  const updatePlan = async (id: number, dto: UpdatePlanDto) => {
    loading.value = true
    try {
      const updated = await planningApi.update(id, dto)
      await invalidatePlanning()
      return updated
    } finally {
      loading.value = false
    }
  }

  return { updatePlan, loading }
}

export function useDeletePlan() {
  const loading = ref(false)

  const deletePlan = async (id: number) => {
    loading.value = true
    try {
      const deleted = await planningApi.delete(id)
      await invalidatePlanning()
      return deleted
    } finally {
      loading.value = false
    }
  }

  return { deletePlan, loading }
}

export function useRepeatPlan() {
  const { user } = useMe()
  const { statisticDate } = useStatisticDateStore()
  const loading = ref(false)

  /** Переносит повторяющийся план в текущий финансовый месяц. */
  const repeatPlan = async (id: number) => {
    loading.value = true
    try {
      const monthStartDay = user.value?.monthStartDay ?? 1
      const repeated = await planningApi.repeat(id, {
        monthIndex: getMonthIndex(statisticDate.value, monthStartDay),
        year: getIndexedYear(statisticDate.value, monthStartDay),
      })
      await invalidatePlanning()
      return repeated
    } finally {
      loading.value = false
    }
  }

  return { repeatPlan, loading }
}

export function useCancelRepeatPlan() {
  const loading = ref(false)

  const cancelRepeatPlan = async (id: number) => {
    loading.value = true
    try {
      const cancelled = await planningApi.cancelRepeat(id)
      await invalidatePlanning()
      return cancelled
    } finally {
      loading.value = false
    }
  }

  return { cancelRepeatPlan, loading }
}
