import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import TransactionsToolbar from './TransactionsToolbar.vue'
import { createEmptyFilters, type TransactionFilters, type TransactionSort } from './types'

const meta = {
  title: 'Transactions/TransactionsToolbar',
  component: TransactionsToolbar,
  // args нужны только для vue-tsc (обязательные модели); сами stories управляют v-model локально.
  args: { filters: createEmptyFilters(), sort: 'date-desc' as TransactionSort },
  decorators: [() => ({ template: '<div class="max-w-[600px]"><story /></div>' })],
} satisfies Meta<typeof TransactionsToolbar>

export default meta
type Story = StoryObj<typeof meta>

const interactive = (initialFilters: TransactionFilters) => ({
  components: { TransactionsToolbar },
  setup() {
    const filters = ref<TransactionFilters>(initialFilters)
    const sort = ref<TransactionSort>('date-desc')
    return { filters, sort }
  },
  template: `
    <div class="flex flex-col gap-4">
      <TransactionsToolbar v-model:filters="filters" v-model:sort="sort" />
      <pre class="text-xs text-muted-foreground">{{ JSON.stringify({ filters, sort }, null, 2) }}</pre>
    </div>
  `,
})

// Пустое состояние: без активных фильтров, чипов нет.
export const Default: Story = {
  render: () => interactive(createEmptyFilters()),
}

// С активными фильтрами: бейдж счётчика, чипы, «Скинути все».
export const WithActiveFilters: Story = {
  render: () => interactive({ search: '', categories: ['food', 'car'], plan: 'unlinked' }),
}
