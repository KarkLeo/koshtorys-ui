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

// Анимированная «волна» (оригинальный WaveChart) — выбранный вариант дизайна.
export const Default: Story = {}

// Перерасход бюджета.
export const Overspent: Story = { args: { current: 4100 } }

// Начало месяца.
export const AlmostEmpty: Story = { args: { current: 120 } }
