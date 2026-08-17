import type { Meta, StoryObj } from '@storybook/vue3-vite'
import LangSwitcher from './LangSwitcher.vue'

const meta = {
  title: 'Switchers/LangSwitcher',
  component: LangSwitcher,
  decorators: [() => ({ template: '<div class="p-6"><story /></div>' })],
} satisfies Meta<typeof LangSwitcher>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
