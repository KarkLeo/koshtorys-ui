<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import KitButton from '@/components/kit/KitButton.vue'
import KitIconButton from '@/components/kit/KitIconButton.vue'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'

const model = defineModel<Date | null>()

defineProps<{
  fullWidth?: boolean
}>()

const currentDate = ref<Date>(new Date())
const displayedMonth = ref<number>(currentDate.value.getMonth())
const displayedYear = ref<number>(currentDate.value.getFullYear())
const isOpen = ref<boolean>(false)
const datePickerRef = ref<HTMLElement | null>(null)
const isPositionTopOfPage = ref<boolean>(true)
const isPositionLeftOfPage = ref<boolean>(true)

const selectDate = (day: number) => {
  isOpen.value = false
  model.value = new Date(Date.UTC(displayedYear.value, displayedMonth.value, day))
}

const checkPositionOnPage = () => {
  if (datePickerRef.value) {
    const { top, bottom, left, right } = datePickerRef.value.getBoundingClientRect()
    const bottomSpace = document.documentElement.clientHeight - bottom
    const rightSpace = document.documentElement.clientWidth - right
    isPositionTopOfPage.value = top < bottomSpace
    isPositionLeftOfPage.value = left < rightSpace
  }
}

const changeMonth = (offset: number) => {
  displayedMonth.value += offset
  if (displayedMonth.value < 0) {
    displayedMonth.value = 11
    displayedYear.value -= 1
  } else if (displayedMonth.value > 11) {
    displayedMonth.value = 0
    displayedYear.value += 1
  }
}

const getDaysInMonth = (month: number, year: number) => {
  const date = new Date(year, month + 1, 0)
  return date.getDate()
}

const isSelected = (day: number): boolean => {
  return Boolean(
    model.value &&
      model.value.getDate() === day &&
      model.value.getMonth() === displayedMonth.value &&
      model.value.getFullYear() === displayedYear.value,
  )
}

const daysInMonth = computed(() => {
  return getDaysInMonth(displayedMonth.value, displayedYear.value)
})

const firstDayOfMonth = computed(() => {
  const date = new Date(displayedYear.value, displayedMonth.value, 1)
  return date.getDay() || 7
})

const handleOpen = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    checkPositionOnPage()
    displayedMonth.value = model.value ? model.value.getMonth() : currentDate.value.getMonth()
    displayedYear.value = model.value ? model.value.getFullYear() : currentDate.value.getFullYear()
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (datePickerRef.value && !datePickerRef?.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  checkPositionOnPage()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    :class="[
      'date-picker',
      {
        'on-top': isPositionTopOfPage,
        'on-bottom': !isPositionTopOfPage,
        'on-left': isPositionLeftOfPage,
        'on-right': !isPositionLeftOfPage,
        'full-width': fullWidth,
      },
    ]"
    ref="datePickerRef"
  >
    <kit-button
      class="date-picker-button"
      variant="secondary-gray"
      @click="handleOpen"
      :fullwidth="fullWidth"
    >
      <icon-calendar class="date-picker-button-icon" />
      <span v-if="model" class="date-picker-button-text">
        {{ model?.toLocaleDateString() }}
      </span>
      <span v-else class="date-picker-button-placeholder">
        {{ $t('calendar.placeholder') }}
      </span>
    </kit-button>
    <div v-if="isOpen" class="date-picker-calendar">
      <div class="date-picker-calendar-header">
        <kit-icon-button @click="changeMonth(-1)">
          <icon-chevron-left />
        </kit-icon-button>
        <span class="date-picker-calendar-header-title">
          {{ $t(`calendar.months.${displayedMonth + 1}`) }} {{ displayedYear }}
        </span>
        <kit-icon-button @click="changeMonth(1)">
          <icon-chevron-right />
        </kit-icon-button>
      </div>

      <div class="date-picker-calendar-grid">
        <div v-for="weekday in 7" :key="weekday" class="date-picker-calendar-weekday">
          {{ $t(`calendar.days.${weekday}`) }}
        </div>
        <div v-for="empty in firstDayOfMonth - 1" :key="'empty-' + empty" class="empty" />
        <button
          v-for="day in daysInMonth"
          :class="['date-picker-calendar-day', { selected: isSelected(day) }]"
          :key="day"
          @click="selectDate(day)"
        >
          {{ day }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.date-picker {
  position: relative;

  display: inline-block;
}

.date-picker.full-width {
  width: 100%;
}

.date-picker-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.date-picker-button-icon {
  width: auto;
  height: var(--line-height-text-sm);
}

.date-picker-button-text {
  font-size: var(--font-size-text-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-text-sm);
  color: var(--fg-secondary);
}

.date-picker-button-placeholder {
  font-size: var(--font-size-text-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-text-sm);
  color: var(--text-placeholder);
}

.on-top .date-picker-calendar {
  top: calc(100% + var(--spacing-md));
  bottom: auto;
}

.on-bottom .date-picker-calendar {
  top: auto;
  bottom: calc(100% + var(--spacing-md));
}

.on-left .date-picker-calendar,
.on-right .date-picker-calendar {
  left: 50%;

  transform: translateX(-50%);
}

.date-picker-calendar {
  position: absolute;
  z-index: 999;

  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-2xl) var(--spacing-3xl);

  color: var(--text-secondary);

  background-color: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  box-shadow:
    0 3px 3px -1.5px #0c0e120a,
    0 8px 8px -4px #0c0e1208,
    0 20px 24px -4px #0c0e1214;
}

.date-picker-calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-picker-calendar-header {
  font-size: var(--font-size-text-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-text-md);
  color: var(--fg-secondary);
}

.date-picker-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-xs);
}

.date-picker-calendar-weekday {
  width: 40px;
  height: 40px;
  padding: 10px 8px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: var(--font-size-text-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-text-sm);
  color: var(--text-secondary);
}

.date-picker-calendar-day {
  width: 40px;
  height: 40px;
  padding: 10px 8px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: var(--font-size-text-sm);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-text-sm);
  color: var(--text-secondary);

  background-color: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}
.date-picker-calendar-day:hover {
  background-color: var(--bg-active);
}

.date-picker-calendar-day.selected {
  font-weight: var(--font-weight-medium);
  color: var(--text-white);

  background-color: var(--bg-brand-solid);
  border-radius: 50%;
}

.date-picker-calendar-grid .empty {
  visibility: hidden;
}

@media screen and (min-width: 768px) {
  .on-left .date-picker-calendar {
    left: 0;
    right: auto;

    transform: none;
  }

  .on-right .date-picker-calendar {
    left: auto;
    right: 0;

    transform: none;
  }
}
</style>
