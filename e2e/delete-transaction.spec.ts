/**
 * e2e: Delete transaction with confirmation (Feature 2.4)
 *
 * Regression guard for the "confirm button stays silent" bug: AlertDialogAction
 * (reka DialogClose) closes the dialog on click; if the target id is coupled to
 * the dialog's open-state it gets cleared before the delete handler reads it, so
 * the click does nothing. This test fails if that regresses (the card stays).
 *
 * Scenario:
 *  1. Register + onboard a fresh user (EUR, budget 3400, monthStartDay 1)
 *  2. Create a transaction through the drawer (description "Sushi", amount 52)
 *  3. Open the card's dropdown menu → "Delete"
 *  4. Confirm in the AlertDialog (red "Delete" button)
 *  5. Assert WITHOUT reload: the "Sushi" card is gone, empty state returns
 *
 * i18n labels (en.json):
 *   transaction.list.menu.delete        → "Delete"
 *   transaction.delete_confirm.confirm  → "Delete"
 *   transaction.list.empty              → "No transactions this month"
 */

import { test, expect, type Page } from '@playwright/test'

const PASSWORD = 'TestPassword123!'

function newUser() {
  return {
    name: 'TX Delete E2E',
    email: `tx-delete-${Date.now()}-${Math.floor(Math.random() * 9999)}@example.com`,
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

test.describe.serial('Delete transaction with confirmation', () => {
  const user = newUser()

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await signUpAndOnboard(page, user)
    await page.close()
  })

  test('delete via dropdown + confirm dialog removes the card without reload', async ({ page }) => {
    await login(page, user)
    await expect(page.getByText('No transactions this month')).toBeVisible({ timeout: 8000 })

    // Seed one transaction to delete.
    await createSushiTransaction(page)

    // Open the card's dropdown menu (single icon button inside the card article).
    const card = page.locator('article', { hasText: 'Sushi' })
    await card.getByRole('button').click()

    // Click "Delete" in the dropdown menu.
    await page.getByRole('menuitem', { name: /^Delete$/i }).click()

    // The confirmation AlertDialog appears.
    const confirm = page.getByRole('alertdialog')
    await expect(confirm).toBeVisible({ timeout: 5000 })
    await expect(confirm.getByText('Delete transaction?')).toBeVisible()

    // Click the red confirm "Delete" button (regression point).
    await confirm.getByRole('button', { name: /^Delete$/i }).click()

    // Assert without reload: the card is gone and the empty state returns.
    await expect(page.getByText('Sushi')).toBeHidden({ timeout: 8000 })
    await expect(page.getByText('No transactions this month')).toBeVisible({ timeout: 8000 })
  })
})
