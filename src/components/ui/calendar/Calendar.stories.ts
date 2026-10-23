import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { CalendarDate } from '@internationalized/date'
import { expect, waitFor } from 'storybook/test'
import { i18n } from '@/i18n'
import { Calendar } from '.'

// The calendar takes its language from vue-i18n, so each story pins the interface language first.
const withLocale = (locale: string) => () => {
  i18n.global.locale.value = locale as typeof i18n.global.locale.value
  return { template: '<story />' }
}

const headRow = (root: HTMLElement) =>
  [...root.querySelectorAll('[data-slot="calendar-head-cell"]')].map((cell) =>
    cell.textContent?.trim(),
  )

const heading = (root: HTMLElement) =>
  root.querySelector('[data-slot="calendar-heading"]')?.textContent?.trim() ?? ''

const meta = {
  title: 'UI/Calendar',
  component: Calendar,
  render: () => ({
    components: { Calendar },
    setup: () => ({ month: new CalendarDate(2026, 10, 22) }),
    template: `<Calendar :default-placeholder="month" class="rounded-md border w-fit" />`,
  }),
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Ukrainian: Story = {
  decorators: [withLocale('uk-UA')],
  play: async ({ canvasElement }) => {
    await expect(headRow(canvasElement)).toEqual(['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'нд'])
    await expect(heading(canvasElement)).toMatch(/жовтень/i)
  },
}

export const English: Story = {
  decorators: [withLocale('en')],
  play: async ({ canvasElement }) => {
    await expect(headRow(canvasElement)).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
    await expect(heading(canvasElement)).toMatch(/October/)
  },
}

export const FollowsLanguageSwitch: Story = {
  decorators: [withLocale('uk-UA')],
  play: async ({ canvasElement }) => {
    await expect(headRow(canvasElement)[0]).toBe('пн')
    i18n.global.locale.value = 'en'
    await waitFor(() => expect(headRow(canvasElement)[0]).toBe('Sun'))
    await expect(heading(canvasElement)).toMatch(/October/)
  },
}
