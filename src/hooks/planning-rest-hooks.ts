import { ref, computed, watch } from 'vue'
import { planningApi } from '@/api/services/planning.service'
import { exchangeRateApi } from '@/api/services/exchange-rate.service'
import { useStatisticDateStore } from '@/stores/statisticDateStore'
import { useMe } from '@/hooks/auth-hooks'
import { getMonthIndex, getIndexedYear, getExchangeDate } from '@/helpers/date'
import type { components } from '@/api/types'

type Plan = components['schemas']['PlanResponseDto']

// Module singleton cache is overkill for 3A; a per-mount reactive fetch matches useMonthlyTransactions' spirit.
export function useMonthlyPlanning() {
  const { user } = useMe()
  const { statisticDate } = useStatisticDateStore()

  const plans = ref<Plan[]>([])
  const repeating = ref<Plan[]>([])
  const rates = ref<Record<string, number>>({})
  const loading = ref(false)

  const monthStartDay = computed(() => user.value?.monthStartDay ?? 1)
  const key = computed(() => {
    const mi = getMonthIndex(statisticDate.value, monthStartDay.value)
    const y = getIndexedYear(statisticDate.value, monthStartDay.value)
    return { mi, y }
  })

  const load = async () => {
    if (!user.value) return
    loading.value = true
    try {
      const { mi, y } = key.value
      // getExchangeDate returns a Date; convert to local YYYY-MM-DD string to avoid timezone off-by-one.
      const d = getExchangeDate(mi, y, monthStartDay.value)
      const exchangeDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const [list, rep, rate] = await Promise.all([
        planningApi.getList(mi, y),
        planningApi.getRepeating(mi, y),
        exchangeRateApi.findByDate(exchangeDate),
      ])
      plans.value = list
      repeating.value = rep
      rates.value = (rate?.rates as Record<string, number>) ?? {}
    } finally {
      loading.value = false
    }
  }

  watch([() => key.value.mi, () => key.value.y, () => !!user.value], load, { immediate: true })

  return {
    plans,
    repeating,
    rates,
    loading,
    refetch: load,
    invalidate: load,
  }
}
