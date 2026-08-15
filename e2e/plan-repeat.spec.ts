/**
 * e2e: Recurring plan suggestions (block 3B, Task 11)
 *
 * Scenario:
 *  1. Register + onboard a fresh user (EUR, budget 3400, monthStartDay 1).
 *  2. Seed a repeating (repeat=true) CATEGORY plan in the PREVIOUS financial
 *     month via REST (a suggestion only surfaces when the repeating plan's
 *     month predates the current one — same-month plans never qualify).
 *  3. "Repeat this month" (check icon) moves it into the current month's
 *     plan list and drops it out of the suggestions section.
 *  4. A second seeded plan is dismissed via "Stop suggesting" (circle-slash
 *     icon) and disappears from suggestions without ever entering the list.
 *
 * Selector notes (verified against the running app, see task-11 brief
 * corrections and plan-crud.spec.ts):
 *  - Category ids must be real ids from constants/transaction-categories.ts.
 *    The brief's draft used 'home--rent' / 'transport--taxi', which don't
 *    exist; the real ids are 'housing--rent' / 'transportation--taxi', and
 *    their top-level group labels are "Housing" / "Transportation" (not
 *    "Home" / "Transport").
 *  - The suggestions block is a `<section>` containing the heading text
 *    "Recurring plans" (`planning.suggestions.title`).
 *  - PlanCard action buttons in the suggestion variant expose aria-labels
 *    "Repeat this month" and "Stop suggesting" (`planning.actions.*`).
 *
 * BLOCKED — backend bug, not a selector problem (see task-11-report.md for
 * full repro): `GET /api/plans/repeating` always returns `[]` for the
 * genuinely CURRENT financial month on any server whose local timezone is
 * ahead of UTC (this dev box runs EEST/UTC+3). Root cause is in
 * `koshtorys-api/src/planning/planning.service.ts::getRepeatingPlanningList`:
 * it compares `getStartMonthDate(...)` (built with local-time `new
 * Date(y, m, d)`) against `getMonthPeriod(...)[0]` (built with
 * `Date.UTC(y, m, d)`) via `startOfCurrentPeriod > selectedDate`. For the
 * exact current month these two "same calendar day" instants differ by the
 * server's UTC offset, so the guard spuriously treats the current month as
 * "in the past" and short-circuits to `[]` — verified directly against the
 * running API: a freshly seeded, valid, repeat=true plan is confirmed to
 * exist via `GET /api/plans?monthIndex=<prev>&year=<prev>`, yet
 * `GET /api/plans/repeating?monthIndex=<current>&year=<current>` returns
 * `[]`, while the same query for a FUTURE month correctly returns the plan.
 * This means `RepeatingPlanSuggestions.vue` can never render for the actual
 * current month in this deployment, independent of any frontend code. Since
 * this task's scope is the frontend (koshtorys-ui) and the servers must not
 * be restarted, the tests below are written for the intended behaviour and
 * left in place, but skipped, so the suite stays honest: they will start
 * exercising real coverage the moment the backend guard is fixed (or the
 * server runs in a UTC/UTC-behind timezone) and the skip is removed.
 */

import { test, expect, type Page } from '@playwright/test'

const API = 'http://localhost:3000/api'
const PASSWORD = 'TestPassword123!'

function newUser() {
  return {
    name: 'Plan Repeat E2E',
    email: `plan-repeat-${Date.now()}-${Math.floor(Math.random() * 9999)}@example.com`,
    password: PASSWORD,
  }
}

async function signUpAndOnboard(
  page: Page,
  user: { name: string; email: string; password: string },
  budget = 3400,
) {
  await page.goto('/register')
  await page.getByPlaceholder(/enter your name/i).fill(user.name)
  await page.getByPlaceholder(/enter your email/i).fill(user.email)
  await page.locator('input[type="password"]').first().fill(user.password)
  await page.locator('input[type="password"]').nth(1).fill(user.password)
  await page.getByRole('button', { name: /submit|register|sign up/i }).click()
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 })

  await page.goto('/login')
  await page.getByPlaceholder(/email/i).fill(user.email)
  await page.locator('input[type="password"]').fill(user.password)
  await page.getByRole('button', { name: /submit|login|sign in/i }).click()

  await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 })
  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: 'EUR', exact: true }).click()
  await page.locator('input[type="number"]').first().fill('1')
  await page.locator('input[type="number"]').nth(1).fill(String(budget))
  await page.locator('button[type="submit"]').click()

  await expect(page).toHaveURL(/\/transactions/, { timeout: 10000 })
}

async function login(page: Page, user: { email: string; password: string }) {
  await page.goto('/login')
  await page.getByPlaceholder(/email/i).fill(user.email)
  await page.locator('input[type="password"]').fill(user.password)
  await page.getByRole('button', { name: /submit|login|sign in/i }).click()
  await expect(page).toHaveURL(/\/transactions/, { timeout: 10000 })
}

/** Seeds a repeating CATEGORY plan in the financial month before the current one. */
async function seedRepeatingPlan(
  page: Page,
  opts: { amount: number; categoryId: string },
) {
  // monthStartDay = 1 → no shift; financial month == calendar month.
  const now = new Date()
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const res = await page.request.post(`${API}/plans`, {
    data: {
      type: 'CATEGORY',
      amount: opts.amount,
      currency: 'EUR',
      categoryId: opts.categoryId,
      monthIndex: prev.getMonth(),
      year: prev.getFullYear(),
      repeat: true,
    },
  })
  expect(res.ok(), `seed plan failed: ${res.status()} ${await res.text()}`).toBeTruthy()
}

test.describe.serial('Recurring plan suggestions', () => {
  // See the file header: GET /api/plans/repeating always returns [] for the
  // current month on this server's timezone, a backend bug unrelated to the
  // frontend under test. Remove once koshtorys-api's getRepeatingPlanningList
  // compares same-basis (local-vs-local or UTC-vs-UTC) dates.
  test.skip(true, 'Blocked by backend bug in getRepeatingPlanningList (see file header)')

  const user = newUser()

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await signUpAndOnboard(page, user)
    await page.close()
  })

  test('repeats a suggested plan into the current month', async ({ page }) => {
    await login(page, user)
    await seedRepeatingPlan(page, { amount: 300, categoryId: 'housing--rent' })

    await page.goto('/planning')

    const suggestions = page.locator('section', { hasText: 'Recurring plans' })
    await expect(suggestions).toBeVisible({ timeout: 10000 })
    const housingSuggestion = suggestions.locator('.rounded-xl.border', { hasText: 'Housing' })
    await expect(housingSuggestion).toBeVisible({ timeout: 10000 })

    // Not in the current month's list yet.
    await expect(page.locator('.rounded-xl.border', { hasText: 'Housing' })).toHaveCount(1)

    await housingSuggestion.getByRole('button', { name: 'Repeat this month' }).click()

    // Leaves the suggestions section...
    await expect(housingSuggestion).toBeHidden({ timeout: 10000 })
    await expect(suggestions).toBeHidden({ timeout: 10000 })

    // ...and appears in the current month's plan list.
    const housingGroup = page.locator('.rounded-xl.border', { hasText: 'Housing' })
    await expect(housingGroup).toBeVisible({ timeout: 10000 })
    await expect(housingGroup.getByText('300 €').first()).toBeVisible()
  })

  test('stops suggesting a plan', async ({ page }) => {
    await login(page, user)
    await seedRepeatingPlan(page, { amount: 90, categoryId: 'transportation--taxi' })

    await page.goto('/planning')

    const suggestions = page.locator('section', { hasText: 'Recurring plans' })
    await expect(suggestions).toBeVisible({ timeout: 10000 })
    const taxiSuggestion = suggestions.locator('.rounded-xl.border', { hasText: 'Transportation' })
    await expect(taxiSuggestion).toBeVisible({ timeout: 10000 })

    await taxiSuggestion.getByRole('button', { name: 'Stop suggesting' }).click()

    // Leaves the suggestions section...
    await expect(taxiSuggestion).toBeHidden({ timeout: 10000 })
    await expect(suggestions).toBeHidden({ timeout: 10000 })

    // ...and never shows up in the current month's plan list either.
    await expect(page.locator('.rounded-xl.border', { hasText: 'Transportation' })).toHaveCount(0)
  })
})
