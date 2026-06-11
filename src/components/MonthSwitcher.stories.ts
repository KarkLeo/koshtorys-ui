import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import MonthSwitcher from './MonthSwitcher.vue'

const meta = {
  title: 'Transactions/MonthSwitcher',
  component: MonthSwitcher,
  args: { monthStartDay: 6 },
} satisfies Meta<typeof MonthSwitcher>

export default meta
type Story = StoryObj<typeof meta>

// Интерактивный: листание месяцев меняет период.
export const Default: Story = {
  render: (args) => ({
    components: { MonthSwitcher },
    setup() {
      const date = ref(new Date(2026, 4, 20))
      return { args, date }
    },
    template: '<MonthSwitcher v-model="date" v-bind="args" class="max-w-[600px]" />',
  }),
}

// День начала месяца = 1 (обычный календарный месяц).
export const CalendarMonth: Story = {
  ...Default,
  args: { monthStartDay: 1 },
}
