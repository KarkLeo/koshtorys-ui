import { ref } from 'vue'

// Модульний singleton (як statisticDateStore): відкриття форми «Додати транзакцію»
// піднято на рівень layout, щоб «+» працювала з бара/pill на будь-якій вкладці.
const isOpen = ref(false)

export function useAddTransaction() {
  return {
    isOpen,
    open: () => {
      isOpen.value = true
    },
    close: () => {
      isOpen.value = false
    },
  }
}
