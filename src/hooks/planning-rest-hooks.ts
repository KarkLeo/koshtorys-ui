import { ref, computed, watch, effectScope, type EffectScope } from 'vue'
import { planningApi } from '@/api/services/planning.service'
import { exchangeRateApi } from '@/api/services/exchange-rate.service'
import { useStatisticDateStore } from '@/stores/statisticDateStore'
import { useMe } from '@/hooks/auth-hooks'
import { getMonthIndex, getIndexedYear, getExchangeDate } from '@/helpers/date'
import type { components } from '@/api/types'

type Plan = components['schemas']['PlanResponseDto']

// Состояние модульное (singleton), а не per-mount: форма плана монтируется в App.vue,
// вне PlanningView, и должна уметь инвалидировать тот же самый список.
const plans = ref<Plan[]>([])
const repeating = ref<Plan[]>([])
const rates = ref<Record<string, number>>({})
const loading = ref(false)
const error = ref(false)

// Detached scope: watch создаётся один раз и переживает unmount компонента,
// который первым дёрнул useMonthlyPlanning().
let scope: EffectScope | null = null
let load: () => Promise<void> = async () => {}

// Монотонный токен вызова load(): месяц можно переключить (или инвалидировать)
// быстрее, чем успевает вернуться предыдущий запрос. Без него более старый
// ответ может прилететь позже и молча перезаписать более свежие данные.
let loadToken = 0

function ensureStarted() {
  if (scope) return
  scope = effectScope(true)
  scope.run(() => {
    const { user } = useMe()
    const { statisticDate } = useStatisticDateStore()

    const monthStartDay = computed(() => user.value?.monthStartDay ?? 1)
    const key = computed(() => ({
      mi: getMonthIndex(statisticDate.value, monthStartDay.value),
      y: getIndexedYear(statisticDate.value, monthStartDay.value),
    }))

    load = async () => {
      if (!user.value) return
      const token = ++loadToken
      loading.value = true
      try {
        const { mi, y } = key.value
        // getExchangeDate возвращает Date; переводим в локальный YYYY-MM-DD,
        // иначе таймзона сдвигает день (см. 1e11c73).
        const d = getExchangeDate(mi, y, monthStartDay.value)
        const exchangeDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        // Курс валют запрашиваем отдельно от списков: если exchange-rates упадёт
        // (например 400 «Invalid exchange rate date», когда для «сегодня» ещё нет курса —
        // сервис сравнивает запрошенную дату с UTC-«сейчас», а не с локальным днём), это не
        // должно проглатывать уже успешно пришедшие plans/repeating внутри одного Promise.all.
        const [list, rep, rate] = await Promise.all([
          planningApi.getList(mi, y),
          planningApi.getRepeating(mi, y),
          exchangeRateApi.findByDate(exchangeDate).catch(() => null),
        ])
        // Более свежий load() уже стартовал — не затираем его данные устаревшим ответом.
        if (token !== loadToken) return
        plans.value = list
        repeating.value = rep
        rates.value = (rate?.rates as Record<string, number>) ?? {}
        error.value = false
      } catch (e) {
        // load() is invoked from watch(..., { immediate: true }), which ignores the returned
        // promise — without this catch any /plans or /plans/repeating failure escaped as an
        // unhandled rejection and the list silently stayed empty. Surface a flag instead, the
        // way transactionsStore does, so PlanningView can show an error and a retry button.
        if (token !== loadToken) return
        console.error('[planning-rest-hooks] load failed:', e)
        error.value = true
      } finally {
        // Только самый свежий вызов может снять loading; иначе поздний устаревший
        // ответ погасит индикатор, пока актуальный запрос ещё летит.
        if (token === loadToken) loading.value = false
      }
    }

    watch([() => key.value.mi, () => key.value.y, () => !!user.value], load, { immediate: true })
  })
}

/** Перезагружает активный месяц планирования из любого места приложения. */
export async function invalidatePlanning(): Promise<void> {
  await load()
}

export function useMonthlyPlanning() {
  ensureStarted()

  return {
    plans,
    repeating,
    rates,
    loading,
    error,
    refetch: () => load(),
    invalidate: () => load(),
  }
}
