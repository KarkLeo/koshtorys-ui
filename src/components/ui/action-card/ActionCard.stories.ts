import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ActionCard from './ActionCard.vue'

const meta = {
  title: 'UI/ActionCard',
  component: ActionCard,
  args: { label: 'Дія' },
} satisfies Meta<typeof ActionCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { ActionCard },
    template: `
      <div class="max-w-[200px] p-4">
        <ActionCard label="Планування" />
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { ActionCard },
    template: `
      <div class="max-w-[200px] p-4">
        <ActionCard label="Сканувати чек" :disabled="true" />
      </div>
    `,
  }),
}
