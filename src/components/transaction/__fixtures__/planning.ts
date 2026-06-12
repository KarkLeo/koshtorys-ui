import type { PreparedPlanning } from '@/mappers/planning-mapper.ts'
import type { Planning } from '@/graphql/types.ts'
import { PlanningType } from '@/graphql/types.ts'

/** Minimal Planning shell used in fixture — only fields accessed by the component. */
const makePlanning = (id: string, transactions: { id: string }[] = []): Planning =>
  ({
    id,
    transactions,
  }) as unknown as Planning

/** Two category groups; one plan already linked (disabled in the modal). */
export const mockPlanningTables: { category: string; items: PreparedPlanning[]; total: number }[] =
  [
    {
      category: 'food',
      total: 55,
      items: [
        {
          id: '7',
          type: PlanningType.Transaction,
          description: 'Суші',
          categoryId: 'food--food-delivery',
          categoryName: 'Доставка їжі',
          mainCategory: 'food',
          categoryColor: '#FAC515',
          date: '02.06.2026',
          amount: 50,
          currency: '€',
          originalAmount: null,
          originalCurrency: null,
          repeat: false,
          original: makePlanning('7'),
        },
        {
          id: '8',
          type: PlanningType.Transaction,
          description: 'Кава',
          categoryId: 'food--coffee-tea',
          categoryName: 'Кава / чай',
          mainCategory: 'food',
          categoryColor: '#FAC515',
          date: undefined,
          amount: 5,
          currency: '€',
          originalAmount: null,
          originalCurrency: null,
          repeat: false,
          // This plan is already linked to a transaction → rendered disabled
          original: makePlanning('8', [{ id: 'tx-1' }]),
        },
      ],
    },
    {
      category: 'housing',
      total: 120,
      items: [
        {
          id: '9',
          type: PlanningType.Transaction,
          description: 'Оренда',
          categoryId: 'housing--rent',
          categoryName: 'Оренда',
          mainCategory: 'housing',
          categoryColor: '#16B364',
          date: '01.06.2026',
          amount: 120,
          currency: '€',
          originalAmount: 1500,
          originalCurrency: '₴',
          repeat: true,
          original: makePlanning('9'),
        },
      ],
    },
  ]
