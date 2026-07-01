/**
 * e2e: Transactions list (Feature 2.1)
 *
 * Scenario overview (serial — share one registered+onboarded user and one transaction):
 *  1. Empty month       — dashboard shows empty-state text
 *  2. Create + list     — transaction created via REST API, card shows "52 €", budget bar shows "52 / 3400 €"
 *  3. Filters           — search that matches nothing → "Nothing found" + Reset; clear → card back
 *  4. Month switch      — prev month is empty; next month has the card
 *  5. Delete            — "⋮" menu → Delete → card gone, empty state, budget "0 / 3400 €"
 *  6. Load error+retry  — abort network → error state; unroute → Retry → list loads
 *
 * Transaction creation path: REST API via page.request (not the old GraphQL AddTransactionForm).
 * Reason: AddTransactionForm uses Apollo GraphQL mutation which updates the Apollo cache, but the
 * TransactionsView reads from transactionsStore (REST-based). The two caches are independent, so
 * creating via the UI form would require a manual page reload to see the transaction — which is
 * functionally correct but makes the test fragile.  Using page.request.post keeps the test fast
 * and deterministic.
 */

import { test, expect, type Page } from '@playwright/test'

const API = 'http://localhost:3000/api'
const PASSWORD = 'TestPassword123!'

// ---------- helpers ----------

function newUser() {
  return {
    name: 'TX E2E',
    email: `tx-e2e-${Date.now()}-${Math.floor(Math.random() * 9999)}@example.com`,
    password: PASSWORD,
  }
}

/** Register → login → complete onboarding via UI; lands on /transactions. */
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
  await page.locator('input[type="number"]').first().fill('1')          // monthStartDay = 1
  await page.locator('input[type="number"]').nth(1).fill(String(budget)) // monthlyBudget
  await page.locator('button[type="submit"]').click()

  await expect(page).toHaveURL(/\/transactions/, { timeout: 10000 })
}

/**
 * Create a transaction via the REST API using the browser's cookie jar.
 * Returns the created transaction object.
 */
async function createTransactionViaApi(
  page: Page,
  payload: {
    amount: number
    currency: string
    categoryId: string
    date: string
    description?: string
  },
) {
  const response = await page.request.post(`${API}/transactions`, { data: payload })
  expect(response.ok()).toBeTruthy()
  return response.json()
}

// ---------- tests ----------

test.describe.serial('Transactions list', () => {
  const user = newUser()

  // Register + onboard once; all subsequent tests reuse the same browser context (same cookies).
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await signUpAndOnboard(page, user)
    await page.close()
  })

  // ── 1. Empty month ──────────────────────────────────────────────────────────
  test('1. empty month shows empty-state text', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder(/email/i).fill(user.email)
    await page.locator('input[type="password"]').fill(user.password)
    await page.getByRole('button', { name: /submit|login|sign in/i }).click()
    await expect(page).toHaveURL(/\/transactions/, { timeout: 10000 })

    // Transactions tab is active by default (first tab).
    await expect(page.getByText('No transactions this month')).toBeVisible({ timeout: 8000 })
  })

  // ── 2. Create + list ────────────────────────────────────────────────────────
  test('2. transaction card appears after creation and budget bar updates', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder(/email/i).fill(user.email)
    await page.locator('input[type="password"]').fill(user.password)
    await page.getByRole('button', { name: /submit|login|sign in/i }).click()
    await expect(page).toHaveURL(/\/transactions/, { timeout: 10000 })

    // Create transaction via REST API (cookies are shared with page.request).
    const now = new Date()
    // Use the 5th of the current month to stay safely within monthStartDay=1 financial month.
    const txDate = new Date(now.getFullYear(), now.getMonth(), 5)
    await createTransactionViaApi(page, {
      amount: 52,
      currency: 'EUR',
      categoryId: 'food--groceries',
      date: txDate.toISOString(),
    })

    // Reload so the transactionsStore fetches fresh data from REST.
    await page.reload()
    await expect(page).toHaveURL(/\/transactions/, { timeout: 10000 })

    // Card with the amount
    await expect(page.getByText('52 €')).toBeVisible({ timeout: 8000 })

    // Budget bar text: "52 / 3400 €"
    await expect(page.getByText('52 / 3400 €')).toBeVisible({ timeout: 8000 })
  })

  // ── 3. Filters ──────────────────────────────────────────────────────────────
  test('3. search filter shows empty-filtered state and reset restores card', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder(/email/i).fill(user.email)
    await page.locator('input[type="password"]').fill(user.password)
    await page.getByRole('button', { name: /submit|login|sign in/i }).click()
    await expect(page).toHaveURL(/\/transactions/, { timeout: 10000 })

    // Wait for card to be visible first.
    await expect(page.getByText('52 €')).toBeVisible({ timeout: 8000 })

    // Type a query that matches nothing.
    const searchInput = page.getByPlaceholder(/search by description/i)
    await searchInput.fill('xyzzy-no-match-at-all')

    // "Nothing found" text and "Reset filters" button appear.
    await expect(page.getByText('Nothing found')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: /reset filters/i })).toBeVisible()

    // Click reset → card is back.
    await page.getByRole('button', { name: /reset filters/i }).click()
    await expect(page.getByText('52 €')).toBeVisible({ timeout: 5000 })
    // Search input should be cleared.
    await expect(searchInput).toHaveValue('')
  })

  // ── 4. Month switch ─────────────────────────────────────────────────────────
  test('4. navigating to previous month shows empty state; next month shows the card', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.getByPlaceholder(/email/i).fill(user.email)
    await page.locator('input[type="password"]').fill(user.password)
    await page.getByRole('button', { name: /submit|login|sign in/i }).click()
    await expect(page).toHaveURL(/\/transactions/, { timeout: 10000 })

    // Confirm card visible in current month.
    await expect(page.getByText('52 €')).toBeVisible({ timeout: 8000 })

    // Click the left (prev month) chevron button inside MonthSwitcher.
    const monthSwitcher = page.locator('.flex.items-center.justify-between.gap-2.rounded-xl.border')
    const prevBtn = monthSwitcher.getByRole('button').first()
    await prevBtn.click()

    // Previous month is empty.
    await expect(page.getByText('No transactions this month')).toBeVisible({ timeout: 5000 })

    // Click the right (next month) chevron to go back.
    const nextBtn = monthSwitcher.getByRole('button').last()
    await nextBtn.click()

    // Card is back.
    await expect(page.getByText('52 €')).toBeVisible({ timeout: 5000 })
  })

  // ── 5. Delete ───────────────────────────────────────────────────────────────
  test('5. delete transaction via dropdown; card gone and budget bar resets', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder(/email/i).fill(user.email)
    await page.locator('input[type="password"]').fill(user.password)
    await page.getByRole('button', { name: /submit|login|sign in/i }).click()
    await expect(page).toHaveURL(/\/transactions/, { timeout: 10000 })

    // Wait for transaction card.
    await expect(page.getByText('52 €')).toBeVisible({ timeout: 8000 })

    // Open the ⋮ dropdown on the transaction card (DropdownMenuTrigger button with EllipsisVertical icon).
    const card = page.locator('article').filter({ hasText: '52 €' }).first()
    await card.getByRole('button').last().click()

    // Click "Delete" in the dropdown.
    await page.getByRole('menuitem', { name: /delete/i }).click()

    // Card is gone, empty state appears, budget bar shows 0 / 3400 €.
    await expect(page.getByText('52 €')).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText('No transactions this month')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('0 / 3400 €')).toBeVisible({ timeout: 5000 })
  })

  // ── 6. Load error + retry ───────────────────────────────────────────────────
  test('6. network error shows error state; retry loads the list', async ({ page }) => {
    // Abort all GET requests to /api/transactions?** BEFORE navigating.
    await page.route('**/api/transactions?**', (route) => route.abort())

    await page.goto('/login')
    await page.getByPlaceholder(/email/i).fill(user.email)
    await page.locator('input[type="password"]').fill(user.password)
    await page.getByRole('button', { name: /submit|login|sign in/i }).click()
    await expect(page).toHaveURL(/\/transactions/, { timeout: 10000 })

    // Error state + Retry button should appear.
    await expect(page.getByText('Failed to load transactions')).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible()

    // Remove the abort route and click Retry.
    await page.unroute('**/api/transactions?**')
    await page.getByRole('button', { name: /retry/i }).click()

    // Error state should disappear.
    await expect(page.getByText('Failed to load transactions')).not.toBeVisible({ timeout: 8000 })

    // After retry, either a transaction card OR the empty-state OR the budget bar
    // must be visible — any of these confirms the list loaded successfully.
    // (The transaction was deleted in test 5, so empty-state is expected here.)
    await expect(
      page.getByText('No transactions this month').or(page.locator('article').first()),
    ).toBeVisible({ timeout: 8000 })
  })
})
