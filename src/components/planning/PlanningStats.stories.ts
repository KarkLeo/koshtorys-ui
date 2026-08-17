import type { Meta, StoryObj } from '@storybook/vue3-vite'
import PlanningStats from './PlanningStats.vue'

const meta = {
  title: 'Planning/PlanningStats',
  component: PlanningStats,
  decorators: [() => ({ template: '<div class="max-w-2xl"><story /></div>' })],
} satisfies Meta<typeof PlanningStats>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    stats: {
      monthlyBudget: 3400,
      plannedExpenses: 2100,
      freeMoney: 800,
      remainingToPay: 1200,
    },
    currency: '€',
  },
}
