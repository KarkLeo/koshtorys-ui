import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MainHeader from './MainHeader.vue'

const mockUser = {
  id: 1,
  name: 'Іван Тест',
  email: 'ivan@example.com',
  lang: 'uk-UA',
  currency: 'UAH',
  monthStartDay: 1,
  monthlyBudget: 25000,
  onboardingAt: '2025-01-01T00:00:00.000Z',
}

const meta = {
  title: 'Layout/MainHeader',
  component: MainHeader,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MainHeader>

export default meta
type Story = StoryObj<typeof meta>

// No user in the store → logo + theme toggle + language switcher.
export const LoggedOut: Story = {}

// User seeded → navigation menu + theme toggle + sign-out.
export const LoggedIn: Story = {
  parameters: { mockUser },
}
