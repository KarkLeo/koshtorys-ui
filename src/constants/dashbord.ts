import TransactionTab from '@/components/transaction/TransactionTab.vue'
import PlanningTab from '@/components/planning/PlanningTab.vue'
import StatisticsTab from '@/components/statistics/StatisticsTab.vue'

export const DASHBOARD_TABS = [
  {
    key: 'transactions',
    component: TransactionTab,
  },
  {
    key: 'planning',
    component: PlanningTab,
  },
  {
    key: 'statistics',
    component: StatisticsTab,
  },
]
