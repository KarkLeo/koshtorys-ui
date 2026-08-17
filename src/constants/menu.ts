import type { Component } from 'vue'
import { Wallet, Calendar, BarChart3, Settings } from 'lucide-vue-next'

export interface NavTab {
  icon: Component
  name: string
  path: string
}

export const NAV_TABS: NavTab[] = [
  { icon: Wallet, name: 'transactions', path: '/transactions' },
  { icon: Calendar, name: 'planning', path: '/planning' },
  { icon: BarChart3, name: 'statistics', path: '/statistics' },
  { icon: Settings, name: 'settings', path: '/settings' },
]

export const ONBOARDING_PATHS = '/onboarding'
