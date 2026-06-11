import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SettingsField from './SettingsField.vue'
import { Input } from '@/components/ui/input'

const meta = {
  title: 'Settings/SettingsField',
  component: SettingsField,
  parameters: { layout: 'centered' },
  decorators: [() => ({ template: '<div class="w-[640px] max-w-full px-4 md:px-6"><story /></div>' })],
  // Horizontal layout on md+: label/description on the left, control on the right.
  render: (args) => ({
    components: { SettingsField, Input },
    setup() {
      return { args }
    },
    template: `
      <SettingsField v-bind="args">
        <Input :aria-invalid="args.error" placeholder="Enter your name" />
      </SettingsField>
    `,
  }),
  args: {
    label: 'Name',
    description: 'Your name is used for personalized greetings.',
  },
} satisfies Meta<typeof SettingsField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithError: Story = {
  args: {
    error: true,
    message: 'Name must be at least 3 characters',
  },
}
