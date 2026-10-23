import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { expect, userEvent, waitFor, within } from 'storybook/test'
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

/**
 * The trigger must sit in the form's tab order. reka-ui's own ComboboxTrigger renders
 * `tabindex="-1"`, and `@/components/ui/combobox` used to re-export it directly, which
 * skipped our wrapper that overrides it.
 */
export const KeyboardReachable: Story = {
  render: () => ({
    components: { CategoryPicker },
    setup() {
      const modelValue = ref('')
      return { modelValue }
    },
    template: `
      <div class="max-w-[400px] space-y-2 p-6">
        <input aria-label="Before" class="w-full rounded-md border px-3 py-2 text-sm" />
        <CategoryPicker v-model="modelValue" />
        <pre data-testid="model" class="mt-4 text-xs text-muted-foreground">{{ modelValue }}</pre>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The list is portalled to document.body, outside canvasElement.
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByLabelText('Before'))
    await userEvent.tab()
    const trigger = canvas.getByRole('button', { name: 'Show popup' })
    await expect(trigger).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    const search = await body.findByPlaceholderText('Search category...')
    await waitFor(() => expect(search).toHaveFocus())

    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('model').textContent).not.toBe(''))
  },
}

/** Reopening on an existing selection must not prefill the search with the raw category id. */
export const ReopenKeepsSearchEmpty: Story = {
  render: () => interactive('food--food-delivery'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('button', { name: 'Show popup' }))
    const search = await body.findByPlaceholderText('Search category...')
    await expect(search).toHaveValue('')
  },
}
