import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'
import { getMonthIndex } from '@/helpers/date.ts'
import { useMutation, useQuery } from '@vue/apollo-composable'
import type {
  CreatePlanningMutation,
  CreatePlanningMutationVariables,
  DeletePlanningMutation,
  DeletePlanningMutationVariables,
  PlanningQuery,
  PlanningQueryVariables,
  UpdatePlanningMutation,
  UpdatePlanningMutationVariables,
} from '@/graphql/types.ts'
import CREATE_PLANNING from '@/graphql/create-planning.graphql'
import UPDATE_PLANNING from '@/graphql/update-planning.graphql'
import DELETE_PLANNING from '@/graphql/delete-planning.graphql'
import PLANNING from '@/graphql/planning.graphql'
import { watch } from 'vue'
import { useMe } from '@/hooks/auth-hooks.ts'

export const useCreatePlanning = () => {
  const { me } = useMe()
  const { statisticDate } = useStatisticDateStore()

  const { mutate } = useMutation<CreatePlanningMutation, CreatePlanningMutationVariables>(
    CREATE_PLANNING,
  )

  const createPlanning = async (variables: CreatePlanningMutationVariables) => {
    try {
      const monthIndex = getMonthIndex(statisticDate.value, me.value?.me.monthStartDay)
      const year = statisticDate.value.getFullYear()

      const result = await mutate(variables, {
        refetchQueries: [{ query: PLANNING, variables: { monthIndex, year } }],
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
      const year = statisticDate.value.getFullYear()

      const result = await mutate(variables, {
        refetchQueries: [{ query: PLANNING, variables: { monthIndex, year } }],
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
      const year = statisticDate.value.getFullYear()

      const result = await mutate(variables, {
        refetchQueries: [{ query: PLANNING, variables: { monthIndex, year } }],
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
  const year = statisticDate.value.getFullYear()

  const { result, refetch } = useQuery<PlanningQuery, PlanningQueryVariables>(PLANNING, {
    monthIndex,
    year,
  })

  watch(statisticDate, (date) => {
    refetch({
      monthIndex: getMonthIndex(date, me.value?.me.monthStartDay),
      year: date.getFullYear(),
    })
  })

  return {
    planning: result,
  }
}
