import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { components } from '@/api/types'
import PlanCard from './PlanCard.vue'
import type { PreparedPlan } from '@/helpers/planning-rest'

const meta = {
  title: 'Planning/PlanCard',
  component: PlanCard,
  decorators: [() => ({ template: '<div class="max-w-md"><story /></div>' })],
} satisfies Meta<typeof PlanCard>

export default meta
type Story = StoryObj<typeof meta>

const mockOriginalPlan: components['schemas']['PlanResponseDto'] = {
  id: 1,
  type: 'TRANSACTION',
  userId: 1,
  date: '2026-07-15',
  monthIndex: 7,
  year: 2026,
  amount: 100,
  description: 'Weekly groceries',
  currency: 'USD',
  categoryId: 'food--groceries',
  repeat: false,
  repeatedPlanningId: null,
  parentPlanningId: null,
  createdAt: '2026-07-01T00:00:00Z',
  updatedAt: '2026-07-01T00:00:00Z',
}

const mockOneOffPlan: PreparedPlan = {
  original: mockOriginalPlan,
  id: '1',
  type: 'TRANSACTION',
  amount: 100,
  currency: 'USD',
  spent: 50,
  categoryId: 'food--groceries',
  categoryName: 'Food: Groceries',
  mainCategory: 'food',
  categoryColor: '#FF6B6B',
  date: '2026-07-15',
  repeat: false,
  description: 'Weekly groceries',
  linkedCount: 1,
}

const mockDynamicPlan: PreparedPlan = {
  original: {
    ...mockOriginalPlan,
    id: 2,
    type: 'CATEGORY',
    amount: 101,
    description: null,
    currency: 'EUR',
    categoryId: 'transportation',
    repeat: true,
    date: null,
  },
  id: '2',
  type: 'CATEGORY',
  amount: 101,
  currency: 'EUR',
  spent: 75,
  categoryId: 'transportation',
  categoryName: 'Transportation',
  mainCategory: 'transportation',
  categoryColor: '#4ECDC4',
  repeat: true,
  description: undefined,
  linkedCount: 0,
}

const mockOverspentPlan: PreparedPlan = {
  original: {
    ...mockOriginalPlan,
    id: 3,
    type: 'TRANSACTION',
    amount: 120,
    description: 'Monthly rent',
    currency: 'UAH',
    categoryId: 'housing--rent',
    repeat: false,
    date: '2026-08-01',
  },
  id: '3',
  type: 'TRANSACTION',
  amount: 120,
  currency: 'UAH',
  originalAmount: 4,
  originalCurrency: 'EUR',
  spent: 140,
  categoryId: 'housing--rent',
  categoryName: 'Housing: Rent',
  mainCategory: 'housing',
  categoryColor: '#FFE66D',
  date: '2026-08-01',
  repeat: false,
  description: 'Monthly rent',
  linkedCount: 1,
}

export const OneOff: Story = {
  args: {
    plan: mockOneOffPlan,
  },
}

export const Suggestion: Story = {
  args: {
    plan: { ...mockOneOffPlan, date: '2026-07-15T00:00:00.000Z', repeat: true },
    variant: 'suggestion',
  },
}

export const Dynamic: Story = {
  args: {
    plan: mockDynamicPlan,
  },
}

export const Overspent: Story = {
  args: {
    plan: mockOverspentPlan,
  },
}
