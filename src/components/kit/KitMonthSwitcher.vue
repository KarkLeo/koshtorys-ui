<script setup lang="ts">
import KitIconButton from '@/components/kit/KitIconButton.vue'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'
import { computed } from 'vue'
import { useMe } from '@/hooks/auth-hooks.ts'
import { getMonthIndex, getMonthPeriod } from '@/helpers/date.ts'

const model = defineModel<Date>({
  default: new Date(),
})

const { user } = useMe()

const showedMonth = computed(() => {
  return getMonthIndex(model.value, user.value?.monthStartDay) + 1
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
  return getMonthPeriod(user.value?.monthStartDay, model.value)
})
</script>

<template>
  <div class="month-switcher">
    <KitIconButton @click="handlePrevMonth" class="month-switcher-button">
      <IconChevronLeft />
    </KitIconButton>
    <div class="month-switcher-value">
      <div class="month-switcher-month">{{ $t(`calendar.months.${showedMonth}`) }}</div>
      <div class="month-switcher-range">
        <span>{{ currentPeriod[0].toLocaleDateString() }}</span>
        -
        <span>{{ currentPeriod[1].toLocaleDateString() }}</span>
      </div>
    </div>
    <KitIconButton @click="handleNextMonth" class="month-switcher-button">
      <IconChevronRight />
    </KitIconButton>
  </div>
</template>

<style scoped>
.month-switcher {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  gap: var(--spacing-sm);
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
