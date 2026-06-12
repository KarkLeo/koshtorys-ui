import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import CategoryPicker from './CategoryPicker.vue'

const meta = {
  title: 'UI/CategoryPicker',
  component: CategoryPicker,
  args: { modelValue: '' },
} satisfies Meta<typeof CategoryPicker>

export default meta
type Story = StoryObj<typeof meta>

const interactive = (initialValue: string, error = false) => ({
  components: { CategoryPicker },
  setup() {
    const modelValue = ref(initialValue)
    return { modelValue, error }
  },
  template: `
    <div class="max-w-[400px] p-6">
      <CategoryPicker v-model="modelValue" :error="error" />
      <pre class="mt-4 text-xs text-muted-foreground">{{ JSON.stringify({ modelValue }, null, 2) }}</pre>
    </div>
  `,
})

export const Empty: Story = {
  render: () => interactive(''),
}

export const Selected: Story = {
  render: () => interactive('food--food-delivery'),
}

export const ErrorState: Story = {
  render: () => interactive('', true),
}
