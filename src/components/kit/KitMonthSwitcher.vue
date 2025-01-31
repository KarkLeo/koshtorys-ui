<script setup lang="ts">
import KitIconButton from '@/components/kit/KitIconButton.vue'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'
import { computed } from 'vue'
import { useMe } from '@/hooks/auth-hooks.ts'

const model = defineModel<Date>({
  default: new Date(),
})

const { me } = useMe()

const showedMonth = computed(() => {
  const monthStartDay = me.value?.me?.monthStartDay
  if (!monthStartDay) return model.value.getMonth() + 1

  const monthShift = monthStartDay > 15 ? 1 : 0

  const monthIndex =
    model.value.getDate() < monthStartDay
      ? model.value.getMonth() + monthShift
      : model.value.getMonth() + monthShift + 1

  return monthIndex > 12 ? monthIndex - 12 : monthIndex
})

const handlePrevMonth = () => {
  model.value = new Date(
    model.value.getFullYear(),
    model.value.getMonth() - 1,
    Math.min(model.value.getDate(), 28),
  )
}
const handleNextMonth = () => {
  model.value = new Date(
    model.value.getFullYear(),
    model.value.getMonth() + 1,
    Math.min(model.value.getDate(), 28),
  )
}

const currentPeriod = computed(() => {
  const monthStartDay = me.value?.me?.monthStartDay

  if (!monthStartDay) {
    return [
      new Date(model.value.getFullYear(), model.value.getMonth(), 1),
      new Date(model.value.getFullYear(), model.value.getMonth() + 1, 0),
    ]
  }
  return model.value.getDate() < monthStartDay
    ? [
        new Date(model.value.getFullYear(), model.value.getMonth() - 1, monthStartDay),
        new Date(model.value.getFullYear(), model.value.getMonth(), monthStartDay - 1),
      ]
    : [
        new Date(model.value.getFullYear(), model.value.getMonth(), monthStartDay),
        new Date(model.value.getFullYear(), model.value.getMonth() + 1, monthStartDay - 1),
      ]
})
</script>

<template>
  <div class="month-switcher">
    <kit-icon-button @click="handlePrevMonth" class="month-switcher-button">
      <icon-chevron-left />
    </kit-icon-button>
    <div class="month-switcher-value">
      <div class="month-switcher-month">{{ $t(`calendar.months.${showedMonth}`) }}</div>
      <div class="month-switcher-range">
        <span>{{ currentPeriod[0].toLocaleDateString() }}</span>
        -
        <span>{{ currentPeriod[1].toLocaleDateString() }}</span>
      </div>
    </div>
    <kit-icon-button @click="handleNextMonth" class="month-switcher-button">
      <icon-chevron-right />
    </kit-icon-button>
  </div>
</template>

<style scoped>
.month-switcher {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xl);
  gap: var(--spacing-xl);
  box-sizing: border-box;

  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
}

.month-switcher-button {
  flex-shrink: 0;
  flex-grow: 0;
}

.month-switcher-value {
  display: flex;
  flex-direction: column;
  gap: var(--radius-xxs);
  width: 100%;
  box-sizing: border-box;
}

.month-switcher-month {
  font-size: var(--font-size-text-md);
  line-height: var(--line-height-text-md);
  font-weight: var(--font-weight-semibold);
  color: var(--fg-secondary);
  text-align: center;
}
.month-switcher-range {
  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-regular);
  color: var(--text-disabled);
  text-align: center;
}
</style>
