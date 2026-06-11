import type { Meta, StoryObj } from '@storybook/vue3-vite'
import OnboardingView from './OnboardingView.vue'

const meta = {
  title: 'Auth/OnboardingView',
  component: OnboardingView,
  parameters: { layout: 'fullscreen' },
  decorators: [
    () => ({ template: '<div class="flex min-h-screen flex-col bg-background"><story /></div>' }),
  ],
} satisfies Meta<typeof OnboardingView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
