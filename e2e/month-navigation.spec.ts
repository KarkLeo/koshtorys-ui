/**
 * e2e: Financial month navigation (Feature 2.6)
 *
 * Scenario:
 *  1. Register + onboard a fresh user (EUR, budget 3400, monthStartDay 1)
 *  2. Create a transaction in the current month (description "Sushi")
 *  3. Click next month (ChevronRight) → empty state, "Sushi" gone
 *  4. Click prev month (ChevronLeft) → back to current month, "Sushi" visible again
 *
 * MonthSwitcher renders two ghost icon-buttons with lucide ChevronLeft/ChevronRight
 * (svg.lucide-chevron-left / svg.lucide-chevron-right). No text/aria label.
 */

import { test, expect, type Page } from '@playwright/test'

const PASSWORD = 'TestPassword123!'

function newUser() {
  return {
    name: 'TX Month E2E',
    email: `tx-month-${Date.now()}-${Math.floor(Math.random() * 9999)}@example.com`,
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

async function createSushiTransaction(page: Page) {
  await page.getByRole('button', { name: /^\+\s*Add$/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })

  await page.getByPlaceholder('00.00').fill('52')

  const dialog = page.getByRole('dialog')
  await dialog.getByText('Select category').click()
  await page.getByPlaceholder('Search category...').fill('Food')
  await page.getByRole('option', { name: /^Food$/i }).first().click()

  await page.getByPlaceholder('Enter description').fill('Sushi')

  await dialog.getByRole('button', { name: /^Add$/i }).click()
  await expect(page.getByText('Sushi')).toBeVisible({ timeout: 8000 })
}

test.describe.serial('Financial month navigation', () => {
  const user = newUser()

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await signUpAndOnboard(page, user)
    await page.close()
  })

  test('next/prev month shows and hides the current-month transaction', async ({ page }) => {
    await login(page, user)
    await expect(page.getByText('No transactions this month')).toBeVisible({ timeout: 8000 })

    await createSushiTransaction(page)

    const nextBtn = page.locator('button:has(svg.lucide-chevron-right)')
    const prevBtn = page.locator('button:has(svg.lucide-chevron-left)')

    // Next month → empty, the transaction is not here.
    await nextBtn.click()
    await expect(page.getByText('No transactions this month')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Sushi')).toBeHidden({ timeout: 8000 })

    // Back to current month → transaction visible again.
    await prevBtn.click()
    await expect(page.getByText('Sushi')).toBeVisible({ timeout: 8000 })
  })
})
