import { ref } from 'vue'

const statisticDate = ref<Date>(new Date())

export const useStatisticDateStore = () => {
  return {
    statisticDate,
  }
}
