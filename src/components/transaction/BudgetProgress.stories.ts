import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BudgetProgress from './BudgetProgress.vue'

const meta = {
  title: 'Transactions/BudgetProgress',
  component: BudgetProgress,
  args: { current: 3022, max: 3400, currency: 'EUR' },
  decorators: [() => ({ template: '<div class="max-w-[600px]"><story /></div>' })],
} satisfies Meta<typeof BudgetProgress>

export default meta
type Story = StoryObj<typeof meta>

// Вариант A: спокойный градиентный бар (новый).
export const Bar: Story = {}

// Вариант B: анимированная «волна» (текущий WaveChart).
export const Wave: Story = { args: { variant: 'wave' } }

// Перерасход бюджета.
export const Overspent: Story = { args: { current: 4100 } }

// Начало месяца.
export const AlmostEmpty: Story = { args: { current: 120 } }
