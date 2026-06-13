import { computed } from 'vue'
import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'
import { useMe } from '@/hooks/auth-hooks.ts'
import { getExchangeDate, getIndexedYear, getMonthIndex } from '@/helpers/date.ts'
import { useMutation, useQuery } from '@vue/apollo-composable'
import type {
  CanselRepeatingPlanningMutation,
  CanselRepeatingPlanningMutationVariables,
  CreatePlanningMutation,
  CreatePlanningMutationVariables,
  DeletePlanningMutation,
  DeletePlanningMutationVariables,
  Planning,
  PlanningExchangeRateQuery,
  PlanningExchangeRateQueryVariables,
  PlanningQuery,
  PlanningQueryVariables,
  RepeatingPlanningQuery,
  RepeatingPlanningQueryVariables,
  RepeatPlanningMutation,
  RepeatPlanningMutationVariables,
  UpdatePlanningMutation,
  UpdatePlanningMutationVariables,
} from '@/graphql/types.ts'
import CREATE_PLANNING from '@/graphql/create-planning.graphql'
import UPDATE_PLANNING from '@/graphql/update-planning.graphql'
import DELETE_PLANNING from '@/graphql/delete-planning.graphql'
import PLANNING from '@/graphql/planning.graphql'
import PLANNING_EXCHANGE_RATE from '@/graphql/planning-exchange-rate.graphql'
import REPEATING_PLANNING from '@/graphql/repeating-planning.graphql'
import REPEAT_PLANNING from '@/graphql/repeat-planning.graphql'
import CANSEL_REPEATING_PLANNING from '@/graphql/cansel-repeating-planning.graphql'
import type { ApolloCache } from '@apollo/client'

const removeOtherRepeatingPlanning = (
  // eslint-disable-next-line
  cache: ApolloCache<any>,
  currentMonthIndex: number,
  currentYear: number,
) => {
  const existingCache = cache.extract()
  Object.keys(existingCache.ROOT_QUERY).forEach((key) => {
    if (key.startsWith('repeatingPlanning(')) {
      const match = key.match(/monthIndex":(\d+),"year":(\d+)/)

      if (match) {
        const monthIndex = parseInt(match[1], 10)
        const year = parseInt(match[2], 10)

        if (monthIndex !== currentMonthIndex || year !== currentYear) {
          cache.evict({
            id: 'ROOT_QUERY',
            fieldName: 'repeatingPlanning',
            args: { monthIndex, year },
          })
        }
      }
    }
  })
  cache.gc()
}

export const useCreatePlanning = () => {
  const { mutate, loading } = useMutation<CreatePlanningMutation, CreatePlanningMutationVariables>(
    CREATE_PLANNING,
    {
      update(cache, { data }) {
        if (!data?.createPlanning) return

        const newPlanning = data.createPlanning

        // ===== Update planning =====
        cache.updateQuery<{ planning: Planning[] }>(
          {
            query: PLANNING,
            variables: { monthIndex: newPlanning.monthIndex, year: newPlanning.year },
          },
          (data) =>
            data && {
              ...data,
              planning: [...(data?.planning || []), newPlanning] as Planning[],
            },
        )

        // ===== Update Repeating planning =====
        if (newPlanning.repeat) {
          removeOtherRepeatingPlanning(cache, newPlanning.monthIndex, newPlanning.year)
        }
      },
    },
  )

  const createPlanning = async (variables: CreatePlanningMutationVariables) => {
    try {
      const result = await mutate(variables)
      return result?.data?.createPlanning || null
    } catch (e) {
      throw e
    }
  }

  return { createPlanning, loading }
}

export const useUpdatePlanning = () => {
  const { mutate, loading } = useMutation<UpdatePlanningMutation, UpdatePlanningMutationVariables>(
    UPDATE_PLANNING,
    {
      update(cache, { data }) {
        if (!data?.updatePlanning) return

        const updatedPlanning = data.updatePlanning

        // ===== Update planning =====
        cache.updateQuery<{ planning: Planning[] }>(
          {
            query: PLANNING,
            variables: { monthIndex: updatedPlanning.monthIndex, year: updatedPlanning.year },
          },
          (data) =>
            data && {
              ...data,
              planning: (data?.planning || []).map((planning) =>
                planning.id === updatedPlanning.id ? updatedPlanning : planning,
              ) as Planning[],
            },
        )

        // ===== Update Repeating planning =====
        removeOtherRepeatingPlanning(cache, updatedPlanning.monthIndex, updatedPlanning.year)
      },
    },
  )

  const updatePlanning = async (variables: UpdatePlanningMutationVariables) => {
    try {
      const result = await mutate(variables)
      return result?.data?.updatePlanning || null
    } catch (e) {
      throw e
    }
  }

  return { updatePlanning, loading }
}

export const useDeletePlanning = () => {
  const { mutate, loading } = useMutation<DeletePlanningMutation, DeletePlanningMutationVariables>(
    DELETE_PLANNING,
    {
      update(cache, { data }) {
        if (!data?.deletePlanning) return

        const deletedPlanning = data.deletePlanning

        // ===== Update planning =====
        cache.updateQuery<{ planning: Planning[] }>(
          {
            query: PLANNING,
            variables: { monthIndex: deletedPlanning.monthIndex, year: deletedPlanning.year },
          },
          (data) =>
            data && {
              ...data,
              planning: (data?.planning || []).filter(
                (planning) => planning.id !== deletedPlanning.id,
              ) as Planning[],
            },
        )

        // ===== Update Repeating planning =====
        cache.evict({
          id: 'ROOT_QUERY',
          fieldName: 'repeatingPlanning',
        })
        cache.gc()
      },
    },
  )

  const deletePlanning = async (variables: DeletePlanningMutationVariables) => {
    try {
      const result = await mutate(variables)
      return result?.data?.deletePlanning || null
    } catch (e) {
      throw e
    }
  }

  return { deletePlanning, loading }
}

export const useRepeatPlanning = () => {
  const { user } = useMe()
  const { statisticDate } = useStatisticDateStore()

  const { mutate, loading } = useMutation<RepeatPlanningMutation, RepeatPlanningMutationVariables>(
    REPEAT_PLANNING,
    {
      update(cache, { data }) {
        if (!data?.repeatPlanning) return

        const repeatedPlanning = data.repeatPlanning

        // ===== Update planning =====
        cache.updateQuery<{ planning: Planning[] }>(
          {
            query: PLANNING,
            variables: { monthIndex: repeatedPlanning.monthIndex, year: repeatedPlanning.year },
          },
          (data) =>
            data && {
              ...data,
              planning: [...(data?.planning || []), repeatedPlanning] as Planning[],
            },
        )

        // ===== Update Repeating planning =====
        cache.updateQuery<{ repeatingPlanning: Planning[] }>(
          {
            query: REPEATING_PLANNING,
            variables: { monthIndex: repeatedPlanning.monthIndex, year: repeatedPlanning.year },
          },
          (data) =>
            data && {
              ...data,
              repeatingPlanning: (data?.repeatingPlanning || []).filter(
                (planning) => String(planning.id) !== String(repeatedPlanning?.parentPlanningId),
              ) as Planning[],
            },
        )
        removeOtherRepeatingPlanning(cache, repeatedPlanning.monthIndex, repeatedPlanning.year)
      },
    },
  )

  const repeatPlanning = async (planning: Planning) => {
    try {
      const monthIndex = getMonthIndex(statisticDate.value, user.value?.monthStartDay)
      const year = getIndexedYear(statisticDate.value, user.value?.monthStartDay)

      const result = await mutate({
        planningId: Number(planning.id),
        monthIndex,
        year,
      })
      return result?.data?.repeatPlanning || null
    } catch (e) {
      throw e
    }
  }

  return {
    repeatPlanning,
    loading,
  }
}

export const useCanselRepeatingPlanning = () => {
  const { user } = useMe()
  const { statisticDate } = useStatisticDateStore()

  const { mutate, loading } = useMutation<
    CanselRepeatingPlanningMutation,
    CanselRepeatingPlanningMutationVariables
  >(CANSEL_REPEATING_PLANNING, {
    update(cache, { data }) {
      if (!data?.canselRepeatingPlanning) return

      const canceledRepeatedPlanning = data.canselRepeatingPlanning
      const monthIndex = getMonthIndex(statisticDate.value, user.value?.monthStartDay)
      const year = getIndexedYear(statisticDate.value, user.value?.monthStartDay)

      // ===== Update planning =====
      cache.updateQuery<{ planning: Planning[] }>(
        {
          query: PLANNING,
          variables: {
            monthIndex: canceledRepeatedPlanning.monthIndex,
            year: canceledRepeatedPlanning.year,
          },
        },
        (data) =>
          data && {
            ...data,
            planning: (data?.planning || []).map((planning) =>
              planning.id === canceledRepeatedPlanning.id ? canceledRepeatedPlanning : planning,
            ) as Planning[],
          },
      )

      // ===== Update Repeating planning =====
      cache.updateQuery<{ repeatingPlanning: Planning[] }>(
        {
          query: REPEATING_PLANNING,
          variables: { monthIndex, year },
        },
        (data) =>
          data && {
            ...data,
            repeatingPlanning: (data?.repeatingPlanning || []).filter(
              (planning) => String(planning.id) !== String(canceledRepeatedPlanning?.id),
            ) as Planning[],
          },
      )
      removeOtherRepeatingPlanning(cache, monthIndex, year)
    },
  })

  const canselRepeatingPlanning = async (planning: Planning) => {
    const result = await mutate({
      planningId: Number(planning.id),
    })
    return result?.data?.canselRepeatingPlanning || null
  }

  return {
    canselRepeatingPlanning,
    loading,
  }
}

export const usePlanningList = () => {
  const { user } = useMe()
  const { statisticDate } = useStatisticDateStore()

  const variables = computed(() => {
    return {
      monthIndex: getMonthIndex(statisticDate.value, user.value?.monthStartDay),
      year: getIndexedYear(statisticDate.value, user.value?.monthStartDay),
    }
  })

  const { result, loading } = useQuery<PlanningQuery, PlanningQueryVariables>(PLANNING, variables, {
    fetchPolicy: 'cache-and-network',
  })

  return {
    planning: result,
    loading,
  }
}

export const usePlanningExchangeRage = () => {
  const { user } = useMe()
  const { statisticDate } = useStatisticDateStore()

  const variables = computed(() => {
    const monthIndex = getMonthIndex(statisticDate.value, user.value?.monthStartDay)
    const year = getIndexedYear(statisticDate.value, user.value?.monthStartDay)
    return {
      exchangeDate: getExchangeDate(monthIndex, year, user.value?.monthStartDay),
    }
  })

  const { result, loading } = useQuery<
    PlanningExchangeRateQuery,
    PlanningExchangeRateQueryVariables
  >(PLANNING_EXCHANGE_RATE, variables, {
    fetchPolicy: 'cache-first',
  })

  return {
    planningExchangeRage: result,
    loading,
  }
}

export const useRepeatingPlanningList = () => {
  const { user } = useMe()
  const { statisticDate } = useStatisticDateStore()

  const variables = computed(() => {
    return {
      monthIndex: getMonthIndex(statisticDate.value, user.value?.monthStartDay),
      year: getIndexedYear(statisticDate.value, user.value?.monthStartDay),
    }
  })

  const { result, loading } = useQuery<RepeatingPlanningQuery, RepeatingPlanningQueryVariables>(
    REPEATING_PLANNING,
    variables,
    {
      fetchPolicy: 'cache-first',
    },
  )

  return {
    repeatingPlanning: result,
    loading,
  }
}
