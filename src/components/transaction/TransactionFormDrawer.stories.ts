/**
 * Stories for TransactionFormDrawer.
 *
 * The real component mounts cleanly in Storybook because:
 * - `useMe` reads from Pinia `userStore`, populated via `parameters.mockUser`
 *   in the global Storybook decorator (see .storybook/preview.ts).
 * - `useCreateTransaction` uses Pinia + REST (`transactionApi.create`) — no network
 *   dependency at mount time; the request only happens on form submit.
 * - `SelectPlanningModal` (v-if="isPlanningOpen") is NOT rendered initially,
 *   so its data hook (`usePlanningMapperRest`) is not invoked when the story
 *   first mounts.
 *
 * The `mockUser` shape matches `UserResponseDto` from the API types.
 */

import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TransactionFormDrawer from './TransactionFormDrawer.vue'
import type { DisplayTransaction } from './types'

const meta = {
  title: 'Transaction/TransactionFormDrawer',
  component: TransactionFormDrawer,
  parameters: {
    layout: 'padded',
    mockUser: {
      currency: 'EUR',
      monthStartDay: 1,
      monthlyBudget: 3400,
    },
  },
} satisfies Meta<typeof TransactionFormDrawer>

export default meta
type Story = StoryObj<typeof meta>

/** Add-transaction drawer — open by default. */
export const AddOpen: Story = {
  args: {
    mode: 'add',
    open: true,
  },
}

/**
 * Edit-transaction drawer — open with a pre-filled transaction.
 * Header switches to «Редагувати транзакцію», submit button to «Оновити»;
 * amount/currency/description/category/date are seeded from the transaction.
 */
const mockTransaction: DisplayTransaction = {
  id: '101',
  amount: 42.5,
  currency: 'EUR',
  categoryId: 'food--groceries',
  description: 'Тижневі закупи',
  date: new Date('2026-06-15T10:00:00.000Z'),
  createdAt: new Date('2026-06-15T10:00:00.000Z'),
  planningId: null,
}

export const EditOpen: Story = {
  args: {
    mode: 'edit',
    open: true,
    transaction: mockTransaction,
  },
}
