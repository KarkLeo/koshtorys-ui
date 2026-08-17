import { test, expect, type Page } from '@playwright/test'

const PASSWORD = 'TestPassword123!'

function newUser() {
  return {
    name: 'Nav E2E',
    email: `nav-${Date.now()}-${Math.floor(Math.random() * 9999)}@example.com`,
    password: PASSWORD,
  }
}

async function signUpAndOnboard(page: Page, user: { name: string; email: string; password: string }) {
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
  await page.locator('input[type="number"]').nth(1).fill('3400')
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

test.describe.serial('Adaptive navigation', () => {
  const user = newUser()

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await signUpAndOnboard(page, user)
    await page.close()
  })

  test('desktop: tabs in header navigate between routes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await login(page, user)

    await page.getByRole('link', { name: 'Planning' }).click()
    await expect(page).toHaveURL(/\/planning/, { timeout: 8000 })
    await page.getByRole('link', { name: 'Statistics' }).click()
    await expect(page).toHaveURL(/\/statistics/, { timeout: 8000 })
    await page.getByRole('link', { name: 'Settings' }).click()
    await expect(page).toHaveURL(/\/settings/, { timeout: 8000 })
    await page.getByRole('link', { name: 'Transactions' }).click()
    await expect(page).toHaveURL(/\/transactions/, { timeout: 8000 })
  })

  test('mobile: bottom bar visible, "+" opens add form, hidden on settings', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await login(page, user)

    // Bottom bar "+" opens the add-transaction form on the transactions tab.
    await page.getByRole('button', { name: 'Add' }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
    // Below md, ResponsiveSheet renders a vaul Drawer (not a Dialog primitive with
    // native Escape-to-close); close it via its explicit close button instead.
    await page.getByRole('button', { name: 'Close' }).click()
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 })

    // Navigate to settings via bottom bar → "+" is not present.
    // Scoped to the bottom-bar <nav> (last in DOM order): at this viewport the
    // header's MainMenu is also present in the accessibility tree (not hidden
    // below md), so an unscoped getByRole('link', { name: 'Settings' }) matches
    // both and triggers a strict-mode violation. See task-9-report.md.
    await page.locator('nav').last().getByRole('link', { name: 'Settings' }).click()
    await expect(page).toHaveURL(/\/settings/, { timeout: 8000 })
    await expect(page.getByRole('button', { name: 'Add' })).toHaveCount(0)
  })

  test('/dashboard redirects to /transactions', async ({ page }) => {
    await login(page, user)
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/transactions/, { timeout: 8000 })
  })
})
