import type { Meta, StoryObj } from '@storybook/vue3-vite'
import RegisterView from './RegisterView.vue'

const meta = {
  title: 'Auth/RegisterView',
  component: RegisterView,
  parameters: { layout: 'fullscreen' },
  decorators: [
    () => ({ template: '<div class="flex min-h-screen flex-col bg-background"><story /></div>' }),
  ],
} satisfies Meta<typeof RegisterView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
