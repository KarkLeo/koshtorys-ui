/**
 * e2e: Edit transaction through the card context menu (Feature 2.7 / 2.3)
 *
 * Scenario:
 *  1. Register + onboard a fresh user (EUR, budget 3400, monthStartDay 1)
 *  2. Create a transaction through the drawer (description "Sushi", amount 52)
 *  3. Open the card's dropdown menu → "Edit"
 *  4. The edit drawer opens pre-filled; change amount 52→75 and description Sushi→Ramen
 *  5. Submit "Update"
 *  6. Assert WITHOUT reload: card shows "Ramen" + "75 €", old "Sushi" is gone
 *
 * i18n labels (en.json):
 *   transaction.list.menu.edit          → "Edit"
 *   transaction.form.buttons.update     → "Update"
 *   transaction.form.edit_title         → "Edit transaction"
 */

import { test, expect, type Page } from '@playwright/test'

const PASSWORD = 'TestPassword123!'

function newUser() {
  return {
    name: 'TX Edit E2E',
    email: `tx-edit-${Date.now()}-${Math.floor(Math.random() * 9999)}@example.com`,
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

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

async function login(page: Page, user: { email: string; password: string }) {
  await page.goto('/login')
  await page.getByPlaceholder(/email/i).fill(user.email)
  await page.locator('input[type="password"]').fill(user.password)
  await page.getByRole('button', { name: /submit|login|sign in/i }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
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

test.describe.serial('Edit transaction through context menu', () => {
  const user = newUser()

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await signUpAndOnboard(page, user)
    await page.close()
  })

  test('edit via dropdown menu updates the card without reload', async ({ page }) => {
    await login(page, user)
    await expect(page.getByText('No transactions this month')).toBeVisible({ timeout: 8000 })

    await createSushiTransaction(page)

    // Open the card's dropdown menu → Edit.
    const card = page.locator('article', { hasText: 'Sushi' })
    await card.getByRole('button').click()
    await page.getByRole('menuitem', { name: /^Edit$/i }).click()

    // The edit drawer opens (Dialog on desktop) pre-filled from the transaction.
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })
    await expect(dialog.getByText('Edit transaction')).toBeVisible()
    // Amount pre-filled with the original value.
    await expect(page.getByPlaceholder('00.00')).toHaveValue('52')

    // Change amount and description.
    await page.getByPlaceholder('00.00').fill('75')
    await page.getByPlaceholder('Enter description').fill('Ramen')

    // Submit "Update".
    await dialog.getByRole('button', { name: /^Update$/i }).click()

    // Assert without reload: updated card visible, old description gone.
    await expect(page.getByText('Ramen')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('75 €')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Sushi')).toBeHidden({ timeout: 8000 })
  })
})
