import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { CalendarDate } from '@internationalized/date'
import { ref } from 'vue'
import { expect, userEvent } from 'storybook/test'
import { i18n } from '@/i18n'
import { MonthPicker } from '.'

// The picker takes its language from vue-i18n, so each story pins the interface language first.
const withLocale = (locale: string) => () => {
  i18n.global.locale.value = locale as typeof i18n.global.locale.value
  return { template: '<story />' }
}

const heading = (root: HTMLElement) =>
  root.querySelector('[data-slot="month-picker-heading"]')?.textContent?.trim() ?? ''
const cell = (root: HTMLElement, value: string) =>
  root.querySelector<HTMLElement>(`[data-slot="month-picker-cell-trigger"][data-value="${value}"]`)

const meta = {
  title: 'UI/MonthPicker',
  component: MonthPicker,
  render: () => ({
    components: { MonthPicker },
    setup: () => ({
      month: ref(new CalendarDate(2026, 10, 1)),
      min: new CalendarDate(2025, 11, 1),
      max: new CalendarDate(2027, 10, 1),
    }),
    template: `
      <MonthPicker v-model="month" :min-value="min" :max-value="max" class="rounded-md border w-fit" />
      <p data-testid="picked">{{ month?.toString() }}</p>
    `,
  }),
} satisfies Meta<typeof MonthPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Ukrainian: Story = {
  decorators: [withLocale('uk-UA')],
  play: async ({ canvasElement }) => {
    await expect(heading(canvasElement)).toBe('2026')
    await expect(cell(canvasElement, '2026-10-01')).toHaveAttribute('data-selected')
    await expect(cell(canvasElement, '2026-10-01')?.textContent?.trim()).toMatch(/жовт/i)
  },
}

export const English: Story = {
  decorators: [withLocale('en')],
  play: async ({ canvasElement }) => {
    await expect(heading(canvasElement)).toBe('2026')
    await expect(cell(canvasElement, '2026-10-01')?.textContent?.trim()).toBe('Oct')
  },
}

export const PicksAMonth: Story = {
  decorators: [withLocale('en')],
  play: async ({ canvasElement }) => {
    await userEvent.click(cell(canvasElement, '2026-12-01')!)
    await expect(canvasElement.querySelector('[data-testid="picked"]')).toHaveTextContent(
      '2026-12-01',
    )
  },
}

// Months outside min/max are disabled, so a plan can't be moved past the window.
export const KeepsToTheWindow: Story = {
  decorators: [withLocale('en')],
  play: async ({ canvasElement }) => {
    await userEvent.click(
      canvasElement.querySelector<HTMLElement>('[data-slot="month-picker-prev"]')!,
    )
    await expect(heading(canvasElement)).toBe('2025')
    await expect(cell(canvasElement, '2025-10-01')).toHaveAttribute('data-disabled')
    await expect(cell(canvasElement, '2025-11-01')).not.toHaveAttribute('data-disabled')
  },
}
