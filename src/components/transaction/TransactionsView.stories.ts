import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TransactionsView from './TransactionsView.vue'
import { mockTransactions, MOCK_USER_CONTEXT } from './__fixtures__/transactions'

const meta = {
  title: 'Transactions/TransactionsView',
  component: TransactionsView,
  parameters: { layout: 'padded' },
  args: {
    transactions: mockTransactions,
    monthStartDay: MOCK_USER_CONTEXT.monthStartDay,
    monthlyBudget: MOCK_USER_CONTEXT.monthlyBudget,
    currency: MOCK_USER_CONTEXT.currency,
  },
} satisfies Meta<typeof TransactionsView>

export default meta
type Story = StoryObj<typeof meta>

// Полный экран «Витрати» с данными со скриншота.
export const Default: Story = {}

// Вариант бюджета «волна» (старый WaveChart) для сравнения.
export const WaveBudget: Story = { args: { budgetVariant: 'wave' } }

// Загрузка: skeleton-карточки.
export const Loading: Story = { args: { loading: true, transactions: [] } }

// Пустой месяц.
export const EmptyMonth: Story = { args: { transactions: [] } }

// Фильтры ничего не нашли: сообщение + кнопка сброса.
export const EmptyByFilters: Story = {
  args: { initialFilters: { search: 'неіснуючий запит', categories: [], plan: 'all' } },
}
