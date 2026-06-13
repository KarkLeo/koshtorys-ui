/**
 * e2e: Create transaction through the drawer (Feature 2.2)
 *
 * Scenario:
 *  1. Register + onboard a fresh user (EUR, budget 3400, monthStartDay 1)
 *  2. Navigate to the transactions tab — assert empty state
 *  3. Click the bottom-docked "+ Add" trigger button
 *  4. Fill the TransactionFormDrawer: amount 52, category (first option = Food),
 *     currency EUR (default), description "Sushi", date today (default)
 *  5. Submit the form
 *  6. Assert WITHOUT reload:
 *     - a transaction card containing "Sushi" (or "52 €") is visible
 *     - the budget bar shows "52 / 3400 €"
 *
 * The drawer renders as a Dialog on desktop (≥768 px viewport, which is the
 * Playwright default of 1280×720).  The MoneyInput contains the FIRST
 * combobox (currency Select), and CategoryPicker contains the SECOND combobox.
 *
 * i18n labels used (en.json):
 *   transaction.form.buttons.add                      → "Add"
 *   transaction.form.fields.category.placeholder      → "Select category"
 *   transaction.form.fields.description.placeholder   → "Enter description"
 *   categories.food                                   → "Food"
 */

import { test, expect, type Page } from '@playwright/test'

const PASSWORD = 'TestPassword123!'

// ---------- helpers ----------

function newUser() {
  return {
    name: 'TX Drawer E2E',
    email: `tx-drawer-${Date.now()}-${Math.floor(Math.random() * 9999)}@example.com`,
    password: PASSWORD,
  }
}

/** Register → login → complete onboarding via UI; lands on /dashboard. */
async function signUpAndOnboard(
  page: Page,
  user: { name: string; email: string; password: string },
  budget = 3400,
) {
  // Register
  await page.goto('/register')
  await page.getByPlaceholder(/enter your name/i).fill(user.name)
  await page.getByPlaceholder(/enter your email/i).fill(user.email)
  await page.locator('input[type="password"]').first().fill(user.password)
  await page.locator('input[type="password"]').nth(1).fill(user.password)
  await page.getByRole('button', { name: /submit|register|sign up/i }).click()
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 })

  // Login
  await page.goto('/login')
  await page.getByPlaceholder(/email/i).fill(user.email)
  await page.locator('input[type="password"]').fill(user.password)
  await page.getByRole('button', { name: /submit|login|sign in/i }).click()

  // Onboarding
  await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 })
  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: 'EUR', exact: true }).click()
  await page.locator('input[type="number"]').first().fill('1') // monthStartDay = 1
  await page.locator('input[type="number"]').nth(1).fill(String(budget)) // monthlyBudget
  await page.locator('button[type="submit"]').click()

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

// ---------- tests ----------

test.describe.serial('Create transaction through drawer', () => {
  const user = newUser()

  // Register + onboard once; all subsequent tests reuse the same browser context (same cookies).
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await signUpAndOnboard(page, user)
    await page.close()
  })

  // ── 1. Empty state ──────────────────────────────────────────────────────────
  test('1. transactions tab shows empty state for a new user', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder(/email/i).fill(user.email)
    await page.locator('input[type="password"]').fill(user.password)
    await page.getByRole('button', { name: /submit|login|sign in/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    // Transactions tab is active by default.
    await expect(page.getByText('No transactions this month')).toBeVisible({ timeout: 8000 })
  })

  // ── 2. Create via drawer, list + budget bar update without reload ────────────
  test('2. create transaction through drawer; card and budget bar update without reload', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.getByPlaceholder(/email/i).fill(user.email)
    await page.locator('input[type="password"]').fill(user.password)
    await page.getByRole('button', { name: /submit|login|sign in/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    // Wait for empty state to confirm the list has loaded.
    await expect(page.getByText('No transactions this month')).toBeVisible({ timeout: 8000 })

    // ── Open the drawer via the bottom-docked "+ Add" trigger ──
    // The button text is "+" + t('transaction.form.buttons.add') = "+ Add"
    await page.getByRole('button', { name: /^\+\s*Add$/i }).click()

    // The form renders inside a Dialog (desktop viewport ≥768 px).
    // Wait for the dialog to appear (identified by the form title).
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })

    // ── Fill amount ──
    // MoneyInput renders a plain <input type="number" placeholder="00.00">
    await page.getByPlaceholder('00.00').fill('52')

    // ── Select category ──
    // CategoryPicker is a searchable Combobox (reka-ui): its trigger button shows the
    // placeholder "Select category"; opening it reveals a search input + option list.
    const dialogEl = page.getByRole('dialog')
    await dialogEl.getByText('Select category').click()
    await page.getByPlaceholder('Search category...').fill('Food')
    // Choose the "Food" option (categories.food = "Food")
    await page.getByRole('option', { name: /^Food$/i }).first().click()

    // ── Fill description ──
    await page.getByPlaceholder('Enter description').fill('Sushi')

    // ── Currency is already EUR (default from user profile) — no change needed ──

    // ── Date is today by default — no change needed ──

    // ── Submit ──
    // The submit button inside the dialog has the text "Add".
    // We scope to the dialog to avoid accidentally hitting the trigger button outside.
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: /^Add$/i }).click()

    // ── Assert without reload ──

    // Transaction card with description "Sushi" should be visible.
    await expect(page.getByText('Sushi')).toBeVisible({ timeout: 8000 })

    // Transaction card with amount "52 €" should be visible.
    await expect(page.getByText('52 €')).toBeVisible({ timeout: 8000 })

    // Budget bar should reflect spent = 52, budget = 3400.
    await expect(page.getByText('52 / 3400 €')).toBeVisible({ timeout: 8000 })
  })
})
