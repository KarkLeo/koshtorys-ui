import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SettingsView from './SettingsView.vue'

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
  title: 'Settings/SettingsView',
  component: SettingsView,
  parameters: {
    layout: 'fullscreen',
    // Seeds the Pinia user store (see .storybook/preview.ts) so `v-if="user"` passes.
    mockUser,
  },
  decorators: [
    () => ({ template: '<div class="min-h-screen bg-background"><story /></div>' }),
  ],
} satisfies Meta<typeof SettingsView>

export default meta
type Story = StoryObj<typeof meta>

// Defaults to the General tab; switch tabs with the pill switcher.
export const Default: Story = {}
