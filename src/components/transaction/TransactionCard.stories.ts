import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TransactionCard from './TransactionCard.vue'
import { mockTransactions } from './__fixtures__/transactions'

const meta = {
  title: 'Transactions/TransactionCard',
  component: TransactionCard,
  args: { transaction: mockTransactions[1] },
  decorators: [() => ({ template: '<div class="max-w-[600px]"><story /></div>' })],
} satisfies Meta<typeof TransactionCard>

export default meta
type Story = StoryObj<typeof meta>

// Обычная транзакция (Суші, 52 €).
export const Default: Story = {}

// Мультивалютная: 5 € / 6 $ (JetBrains).
export const MultiCurrency: Story = { args: { transaction: mockTransactions[0] } }

// Связана с one-off планом (иконка ссылки).
export const LinkedToPlan: Story = { args: { transaction: mockTransactions[6] } }

// Длинные строки: проверка truncate и переноса.
export const LongContent: Story = {
  args: {
    transaction: {
      ...mockTransactions[2],
      amount: 12345,
      categoryId: 'housing--household-supplies',
      description:
        'Дуже довгий опис транзакції, який має коректно переноситися на кілька рядків і не ламати верстку картки',
    },
  },
}

// Без описания.
export const NoDescription: Story = {
  args: { transaction: { ...mockTransactions[3], description: undefined } },
}
