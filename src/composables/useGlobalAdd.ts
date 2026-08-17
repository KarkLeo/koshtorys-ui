import { computed, ref } from 'vue'

export type AddKind = 'transaction' | 'plan'

// Модульный singleton (как statisticDateStore): какая форма добавления сейчас открыта.
// «+» контекстная — на /planning создаёт план, в остальных местах транзакцию.
const kind = ref<AddKind | null>(null)

export function useGlobalAdd() {
  /** v-model:open для конкретного drawer'а: открыт, только если это его kind. */
  const openFor = (target: AddKind) =>
    computed({
      get: () => kind.value === target,
      set: (value: boolean) => {
        if (!value && kind.value === target) kind.value = null
      },
    })

  return {
    kind,
    transactionOpen: openFor('transaction'),
    planOpen: openFor('plan'),
    open: (target: AddKind) => {
      kind.value = target
    },
    close: () => {
      kind.value = null
    },
  }
}
