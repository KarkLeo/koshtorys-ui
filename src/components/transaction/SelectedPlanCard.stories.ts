import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SelectedPlanCard from './SelectedPlanCard.vue'

const meta: Meta<typeof SelectedPlanCard> = {
  title: 'Transaction/SelectedPlanCard',
  component: SelectedPlanCard,
}
export default meta
type Story = StoryObj<typeof SelectedPlanCard>

export const Default: Story = {
  args: {
    plan: {
      description: 'Суші на вечерю',
      categoryId: 'food--food-delivery',
      amount: 50,
      currency: 'EUR',
    },
  },
}

export const NoDescription: Story = {
  args: {
    plan: {
      description: '',
      categoryId: 'car--fuel',
      amount: 80,
      currency: 'UAH',
    },
  },
}

export const LongDescription: Story = {
  args: {
    plan: {
      description: 'Дуже довгий опис плану який має обрізатися трьома крапками в кінці рядка',
      categoryId: 'housing--rent',
      amount: 1200,
      currency: 'PLN',
    },
  },
}
