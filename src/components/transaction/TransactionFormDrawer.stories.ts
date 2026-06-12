/**
 * Stories for TransactionFormDrawer.
 *
 * The real component mounts cleanly in Storybook because:
 * - `useMe` reads from Pinia `userStore`, populated via `parameters.mockUser`
 *   in the global Storybook decorator (see .storybook/preview.ts).
 * - `useCreateTransaction` uses Pinia + REST (`transactionApi.create`) — no Apollo
 *   dependency at mount time; the network call only happens on form submit.
 * - `SelectPlanningModal` (v-if="isPlanningOpen") is NOT rendered initially,
 *   so its Apollo-dependent hooks (`usePlanningList`, `usePlanningMapper`) are
 *   not invoked when the story first mounts.
 *
 * The `mockUser` shape matches `UserResponseDto` from the API types.
 */

import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TransactionFormDrawer from './TransactionFormDrawer.vue'

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
