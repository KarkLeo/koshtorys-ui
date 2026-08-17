import type { PreparedPlan } from '@/helpers/planning-rest'
import type { components } from '@/api/types'

type Plan = components['schemas']['PlanResponseDto']

/** Minimal PlanResponseDto shell used in fixture. */
const makePlan = (id: number, categoryId: string): Plan => ({
  id,
  type: 'TRANSACTION',
  amount: 0,
  currency: 'EUR',
  categoryId,
  date: null,
  description: null,
  monthIndex: 6,
  year: 2026,
  repeat: false,
  userId: 1,
  repeatedPlanningId: null,
  parentPlanningId: null,
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
})

/** Two category groups; one plan already linked (disabled in the modal). */
export const mockPlanningTables: { category: string; items: PreparedPlan[]; total: number }[] = [
  {
    category: 'food',
    total: 55,
    items: [
      {
        id: '7',
        type: 'TRANSACTION',
        description: 'Суші',
        categoryId: 'food--food-delivery',
        categoryName: 'Доставка їжі',
        mainCategory: 'food',
        categoryColor: '#FAC515',
        date: '02.06.2026',
        amount: 50,
        currency: '€',
        spent: 0,
        originalAmount: null,
        originalCurrency: null,
        converted: true,
        repeat: false,
        linkedCount: 0,
        original: makePlan(7, 'food--food-delivery'),
      },
      {
        id: '8',
        type: 'TRANSACTION',
        description: 'Кава',
        categoryId: 'food--coffee-tea',
        categoryName: 'Кава / чай',
        mainCategory: 'food',
        categoryColor: '#FAC515',
        date: undefined,
        amount: 5,
        currency: '€',
        spent: 5,
        originalAmount: null,
        originalCurrency: null,
        converted: true,
        repeat: false,
        // This plan is already linked to a transaction → rendered disabled
        linkedCount: 1,
        original: makePlan(8, 'food--coffee-tea'),
      },
    ],
  },
  {
    category: 'housing',
    total: 120,
    items: [
      {
        id: '9',
        type: 'TRANSACTION',
        description: 'Оренда',
        categoryId: 'housing--rent',
        categoryName: 'Оренда',
        mainCategory: 'housing',
        categoryColor: '#16B364',
        date: '01.06.2026',
        amount: 120,
        currency: '€',
        spent: 0,
        originalAmount: 1500,
        originalCurrency: '₴',
        converted: true,
        repeat: true,
        linkedCount: 0,
        original: makePlan(9, 'housing--rent'),
      },
    ],
  },
]
