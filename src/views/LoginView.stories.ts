import type { Meta, StoryObj } from '@storybook/vue3-vite'
import LoginView from './LoginView.vue'

const meta = {
  title: 'Auth/LoginView',
  component: LoginView,
  parameters: { layout: 'fullscreen' },
  decorators: [
    () => ({ template: '<div class="flex min-h-screen flex-col bg-background"><story /></div>' }),
  ],
} satisfies Meta<typeof LoginView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
