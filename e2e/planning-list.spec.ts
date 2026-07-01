/**
 * e2e: Planning list renders on REST (block 3A, Task 7)
 *
 * Scenario:
 *  1. Register + onboard a fresh user (EUR, budget 3400, monthStartDay 1)
 *  2. Navigate to Planning via the header nav link → URL /planning
 *  3. Seed a CATEGORY plan (Food, 200 EUR) via API using the page's authenticated
 *     cookies (the Kit `PlanningAddForm` is brittle — see task brief), then reload.
 *  4. Assert the Food category group + a PlanCard with a progress bar are visible.
 *  5. Month-nav: next month → plan not shown; prev month → shown again.
 *
 * MonthSwitcher renders two ghost icon-buttons with lucide ChevronLeft/ChevronRight
 * (svg.lucide-chevron-left / svg.lucide-chevron-right). No text/aria label.
 *
 * monthIndex/year: the frontend (`useMonthlyPlanning` in
 * `src/hooks/planning-rest-hooks.ts`) computes these via `getMonthIndex`/
 * `getIndexedYear` from `helpers/date.ts`. With monthStartDay = 1, there is no
 * month shift and `date.getDate() < 1` is never true, so `monthIndex` is simply
 * the current calendar month (0-based, JS `Date#getMonth()`) and `year` is the
 * current calendar year. We mirror that here rather than hardcoding a value.
 */

import { test, expect, type Page } from '@playwright/test'

const PASSWORD = 'TestPassword123!'

function newUser() {
  return {
    name: 'Planning List E2E',
    email: `planning-list-${Date.now()}-${Math.floor(Math.random() * 9999)}@example.com`,
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

test.describe.serial('Planning list renders on REST', () => {
  const user = newUser()

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await signUpAndOnboard(page, user)
    await page.close()
  })

  test('planning list shows a seeded plan and reacts to month nav', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder(/email/i).fill(user.email)
    await page.locator('input[type="password"]').fill(user.password)
    await page.getByRole('button', { name: /submit|login|sign in/i }).click()
    await expect(page).toHaveURL(/\/transactions/, { timeout: 10000 })

    await page.getByRole('link', { name: 'Planning' }).click()
    await expect(page).toHaveURL(/\/planning/, { timeout: 10000 })

    // monthStartDay = 1 → no shift; financial month == calendar month.
    const now = new Date()
    const monthIndex = now.getMonth()
    const year = now.getFullYear()

    const seedResponse = await page.request.post('http://localhost:3000/api/plans', {
      data: {
        type: 'CATEGORY',
        amount: 200,
        currency: 'EUR',
        categoryId: 'food--groceries',
        monthIndex,
        year,
        repeat: false,
      },
    })
    expect(seedResponse.ok()).toBeTruthy()

    await page.reload()

    const foodGroup = page.locator('.rounded-xl.border', { hasText: 'Food' })
    await expect(foodGroup).toBeVisible({ timeout: 10000 })
    await expect(foodGroup.getByText('200 €').first()).toBeVisible()
    await expect(foodGroup.locator('div[class*="rounded-full"]').first()).toBeVisible()

    const nextBtn = page.locator('button:has(svg.lucide-chevron-right)')
    const prevBtn = page.locator('button:has(svg.lucide-chevron-left)')

    // Next month → the plan belongs to the current month only, so it disappears.
    await nextBtn.click()
    await expect(page.locator('.rounded-xl.border', { hasText: 'Food' })).toBeHidden({
      timeout: 8000,
    })

    // Back to current month → plan visible again.
    await prevBtn.click()
    await expect(page.locator('.rounded-xl.border', { hasText: 'Food' })).toBeVisible({
      timeout: 8000,
    })
  })
})
