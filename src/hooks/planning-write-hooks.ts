import { ref } from 'vue'
import { planningApi } from '@/api/services/planning.service'
import { invalidatePlanning } from '@/hooks/planning-rest-hooks'
import { useStatisticDateStore } from '@/stores/statisticDateStore'
import { useMe } from '@/hooks/auth-hooks'
import { getMonthIndex, getIndexedYear } from '@/helpers/date'
import type { CreatePlanDto, UpdatePlanDto } from '@/helpers/plan-form'

/**
 * Выполняет мутацию и рефрешит список планов. Успешная запись с упавшим
 * рефрешем всё равно должна вернуться успехом — иначе вызывающая форма
 * покажет "ошибка сервера" для операции, которая на самом деле прошла,
 * и пользователь создаст дубликат.
 */
async function withPlanningInvalidate<T>(op: () => Promise<T>): Promise<T> {
  const result = await op()
  try {
    await invalidatePlanning()
  } catch (err) {
    console.error('[planning] failed to refresh plans after write', err)
  }
  return result
}

export function useCreatePlan() {
  const loading = ref(false)

  const createPlan = async (dto: CreatePlanDto) => {
    loading.value = true
    try {
      return await withPlanningInvalidate(() => planningApi.create(dto))
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
      return await withPlanningInvalidate(() => planningApi.update(id, dto))
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
      return await withPlanningInvalidate(() => planningApi.delete(id))
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
      return await withPlanningInvalidate(() =>
        planningApi.repeat(id, {
          monthIndex: getMonthIndex(statisticDate.value, monthStartDay),
          year: getIndexedYear(statisticDate.value, monthStartDay),
        }),
      )
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
      return await withPlanningInvalidate(() => planningApi.cancelRepeat(id))
    } finally {
      loading.value = false
    }
  }

  return { cancelRepeatPlan, loading }
}
