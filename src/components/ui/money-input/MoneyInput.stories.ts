import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import MoneyInput from './MoneyInput.vue'

const meta = {
  title: 'UI/MoneyInput',
  component: MoneyInput,
  args: { amount: '', currency: 'EUR' },
} satisfies Meta<typeof MoneyInput>

export default meta
type Story = StoryObj<typeof meta>

const interactive = (initialAmount: string, initialCurrency: string, error = false) => ({
  components: { MoneyInput },
  setup() {
    const amount = ref(initialAmount)
    const currency = ref(initialCurrency)
    return { amount, currency, error }
  },
  template: `
    <div class="max-w-[400px] rounded-xl border p-6">
      <MoneyInput v-model:amount="amount" v-model:currency="currency" :error="error" />
      <pre class="mt-4 text-xs text-muted-foreground">{{ JSON.stringify({ amount, currency }, null, 2) }}</pre>
    </div>
  `,
})

export const Empty: Story = {
  render: () => interactive('', 'EUR'),
}

export const WithAmount: Story = {
  render: () => interactive('52.5', 'EUR'),
}

export const OtherCurrency: Story = {
  render: () => interactive('120', 'UAH'),
}

export const ErrorState: Story = {
  render: () => interactive('', 'EUR', true),
}
