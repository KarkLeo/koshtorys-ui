import { watch } from 'vue'
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
  PlanningQuery,
  PlanningQueryVariables,
  RepeatPlanningMutation,
  RepeatPlanningMutationVariables,
  UpdatePlanningMutation,
  UpdatePlanningMutationVariables,
} from '@/graphql/types.ts'
import CREATE_PLANNING from '@/graphql/create-planning.graphql'
import UPDATE_PLANNING from '@/graphql/update-planning.graphql'
import DELETE_PLANNING from '@/graphql/delete-planning.graphql'
import PLANNING from '@/graphql/planning.graphql'
import REPEAT_PLANNING from '@/graphql/repeat-planning.graphql'
import CANSEL_REPEATING_PLANNING from '@/graphql/cansel-repeating-planning.graphql'

export const useCreatePlanning = () => {
  const { me } = useMe()
  const { statisticDate } = useStatisticDateStore()

  const { mutate } = useMutation<CreatePlanningMutation, CreatePlanningMutationVariables>(
    CREATE_PLANNING,
  )

  const createPlanning = async (variables: CreatePlanningMutationVariables) => {
    try {
      const monthIndex = getMonthIndex(statisticDate.value, me.value?.me.monthStartDay)
      const year = getIndexedYear(statisticDate.value, me.value?.me.monthStartDay)
      const exchangeDate = getExchangeDate(monthIndex, year, me.value?.me.monthStartDay)

      const result = await mutate(variables, {
        refetchQueries: [{ query: PLANNING, variables: { monthIndex, year, exchangeDate } }],
      })
      return result?.data?.createPlanning || null
    } catch (e) {
      throw e
    }
  }

  return { createPlanning }
}

export const useUpdatePlanning = () => {
  const { me } = useMe()
  const { statisticDate } = useStatisticDateStore()

  const { mutate } = useMutation<UpdatePlanningMutation, UpdatePlanningMutationVariables>(
    UPDATE_PLANNING,
  )

  const updatePlanning = async (variables: UpdatePlanningMutationVariables) => {
    try {
      const monthIndex = getMonthIndex(statisticDate.value, me.value?.me.monthStartDay)
      const year = getIndexedYear(statisticDate.value, me.value?.me.monthStartDay)
      const exchangeDate = getExchangeDate(monthIndex, year, me.value?.me.monthStartDay)

      const result = await mutate(variables, {
        refetchQueries: [{ query: PLANNING, variables: { monthIndex, year, exchangeDate } }],
      })
      return result?.data?.updatePlanning || null
    } catch (e) {
      throw e
    }
  }

  return { updatePlanning }
}

export const useDeletePlanning = () => {
  const { me } = useMe()
  const { statisticDate } = useStatisticDateStore()

  const { mutate } = useMutation<DeletePlanningMutation, DeletePlanningMutationVariables>(
    DELETE_PLANNING,
  )

  const deletePlanning = async (variables: DeletePlanningMutationVariables) => {
    try {
      const monthIndex = getMonthIndex(statisticDate.value, me.value?.me.monthStartDay)
      const year = getIndexedYear(statisticDate.value, me.value?.me.monthStartDay)
      const exchangeDate = getExchangeDate(monthIndex, year, me.value?.me.monthStartDay)

      const result = await mutate(variables, {
        refetchQueries: [{ query: PLANNING, variables: { monthIndex, year, exchangeDate } }],
      })
      return result?.data?.deletePlanning || null
    } catch (e) {
      throw e
    }
  }

  return { deletePlanning }
}

export const usePlanningList = () => {
  const { me } = useMe()
  const { statisticDate } = useStatisticDateStore()

  const monthIndex = getMonthIndex(statisticDate.value, me.value?.me.monthStartDay)
  const year = getIndexedYear(statisticDate.value, me.value?.me.monthStartDay)
  const exchangeDate = getExchangeDate(monthIndex, year, me.value?.me.monthStartDay)

  const { result, refetch } = useQuery<PlanningQuery, PlanningQueryVariables>(PLANNING, {
    monthIndex,
    year,
    exchangeDate,
  })

  watch(statisticDate, (date) => {
    const monthIndex = getMonthIndex(date, me.value?.me.monthStartDay)
    const year = getIndexedYear(date, me.value?.me.monthStartDay)
    const exchangeDate = getExchangeDate(monthIndex, year, me.value?.me.monthStartDay)

    refetch({
      monthIndex,
      year,
      exchangeDate,
    })
  })

  return {
    planning: result,
  }
}

export const useRepeatPlanning = () => {
  const { me } = useMe()
  const { statisticDate } = useStatisticDateStore()

  const { mutate } = useMutation<RepeatPlanningMutation, RepeatPlanningMutationVariables>(
    REPEAT_PLANNING,
  )

  const repeatPlanning = async (planning: Planning) => {
    try {
      const monthIndex = getMonthIndex(statisticDate.value, me.value?.me.monthStartDay)
      const year = getIndexedYear(statisticDate.value, me.value?.me.monthStartDay)
      const exchangeDate = getExchangeDate(monthIndex, year, me.value?.me.monthStartDay)

      const result = await mutate(
        {
          planningId: Number(planning.id),
          monthIndex,
          year,
        },
        {
          refetchQueries: [{ query: PLANNING, variables: { monthIndex, year, exchangeDate } }],
        },
      )
      return result?.data?.repeatPlanning || null
    } catch (e) {
      throw e
    }
  }

  return {
    repeatPlanning,
  }
}

export const useCanselRepeatingPlanning = () => {
  const { me } = useMe()
  const { statisticDate } = useStatisticDateStore()

  const { mutate } = useMutation<
    CanselRepeatingPlanningMutation,
    CanselRepeatingPlanningMutationVariables
  >(CANSEL_REPEATING_PLANNING)

  const canselRepeatingPlanning = async (planning: Planning) => {
    const monthIndex = getMonthIndex(statisticDate.value, me.value?.me.monthStartDay)
    const year = getIndexedYear(statisticDate.value, me.value?.me.monthStartDay)
    const exchangeDate = getExchangeDate(monthIndex, year, me.value?.me.monthStartDay)

    const result = await mutate(
      {
        planningId: Number(planning.id),
      },
      {
        refetchQueries: [{ query: PLANNING, variables: { monthIndex, year, exchangeDate } }],
      },
    )

    return result?.data?.canselRepeatingPlanning || null
  }

  return {
    canselRepeatingPlanning,
  }
}
