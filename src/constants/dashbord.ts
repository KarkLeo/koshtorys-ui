import TransactionTab from '@/components/transaction/TransactionTab.vue'
import PlanningTab from '@/components/planning/PlanningTab.vue'

export const DASHBOARD_TABS = [
  {
    key: 'transaction',
    component: TransactionTab,
  },
  {
    key: 'planning',
    component: PlanningTab,
  },
]
