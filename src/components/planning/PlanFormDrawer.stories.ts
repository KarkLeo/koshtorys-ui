/**
 * Stories for PlanFormDrawer.
 *
 * The real component renders in Storybook because:
 * - `useMe` reads from Pinia `userStore`, populated via `parameters.mockUser`
 *   in the global Storybook decorator (see .storybook/preview.ts).
 * - `useCreatePlan` / `useUpdatePlan` only touch the network on submit.
 *
 * It does NOT mount network-free, though: `useMonthlyPlanning()` in setup fires
 * `/plans`, `/plans/repeating` and `/exchange-rates` (it feeds the parent-plan
 * picker). With no API behind the test run those 401. That is harmless here —
 * the hook catches the failure and raises its `error` flag — but it does mean
 * the parent-plan picker renders empty in these stories.
 *
 * The `mockUser` shape matches `UserResponseDto` from the API types. The
 * plan mocks match `PlanResponseDto`.
 */

import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { within, userEvent } from 'storybook/test'
import PlanFormDrawer from './PlanFormDrawer.vue'
import type { components } from '@/api/types'

type Plan = components['schemas']['PlanResponseDto']

const meta = {
  title: 'Planning/PlanFormDrawer',
  component: PlanFormDrawer,
  parameters: {
    layout: 'padded',
    mockUser: {
      currency: 'EUR',
      monthStartDay: 1,
      monthlyBudget: 3400,
    },
  },
} satisfies Meta<typeof PlanFormDrawer>

export default meta
type Story = StoryObj<typeof meta>

/** Add drawer, one-off plan type selected by default — open by default. */
export const AddOneOff: Story = {
  args: {
    mode: 'add',
    open: true,
  },
}

/**
 * Add drawer with the toggle switched to a dynamic (category budget) plan.
 * The component always mounts in the one-off state and exposes no prop to
 * seed `type`, so the `play` function clicks the "Dynamic budget" toggle
 * item after mount to actually land the story in the dynamic state.
 */
export const AddDynamic: Story = {
  args: {
    mode: 'add',
    open: true,
  },
  play: async ({ canvasElement }) => {
    // ResponsiveSheet renders its Dialog/Drawer content through a portal to
    // document.body, outside canvasElement — query the full document instead.
    const body = within(canvasElement.ownerDocument.body)
    const dynamicToggle = await body.findByRole('button', { name: 'Dynamic budget' })
    await userEvent.click(dynamicToggle)
  },
}

const oneOffPlan: Plan = {
  id: 1,
  type: 'TRANSACTION' as const,
  userId: 1,
  date: '2026-08-15T00:00:00.000Z',
  monthIndex: 7,
  year: 2026,
  amount: 120.5,
  description: 'New laptop',
  currency: 'EUR',
  categoryId: 'food--groceries',
  repeat: false,
  repeatedPlanningId: null,
  parentPlanningId: null,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
}

const dynamicPlan: Plan = {
  ...oneOffPlan,
  id: 2,
  type: 'CATEGORY' as const,
  date: null,
  description: null,
  amount: 200,
  repeat: true,
}

/**
 * Edit drawer, one-off plan — pre-filled from `oneOffPlan`.
 * Date pill must read «15 Aug 2026» (not «14 Aug»): the calendar day is taken
 * from the first 10 characters of the ISO string, not `new Date(iso)`.
 */
export const EditOneOff: Story = {
  args: {
    mode: 'edit',
    open: true,
    plan: oneOffPlan,
  },
}

/** Edit drawer, dynamic (category budget) plan — pre-filled from `dynamicPlan`. */
export const EditDynamic: Story = {
  args: {
    mode: 'edit',
    open: true,
    plan: dynamicPlan,
  },
}
