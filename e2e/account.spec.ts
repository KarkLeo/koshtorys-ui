import { test, expect, type Page } from '@playwright/test'

const PASSWORD = 'TestPassword123!'

function newUser(prefix: string) {
  return {
    name: 'E2E Account',
    email: `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`,
    password: PASSWORD,
  }
}

async function register(page: Page, user: { name: string; email: string; password: string }) {
  await page.goto('/register')
  await page.getByPlaceholder(/enter your name/i).fill(user.name)
  await page.getByPlaceholder(/enter your email/i).fill(user.email)
  await page.locator('input[type="password"]').first().fill(user.password)
  await page.locator('input[type="password"]').nth(1).fill(user.password)
  await page.getByRole('button', { name: /submit|register|sign up/i }).click()
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
}

async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByPlaceholder(/email/i).fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: /submit|login|sign in/i }).click()
}

// Fills the onboarding form (currency + month start + budget) and submits.
async function completeOnboarding(page: Page, currency = 'EUR') {
  await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 })
  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: currency, exact: true }).click()
  await page.locator('input[type="number"]').first().fill('1')
  await page.locator('input[type="number"]').nth(1).fill('20000')
  await page.locator('button[type="submit"]').click()
}

// Registers a fresh user, logs in, and completes onboarding → lands on /transactions.
async function signUpAndOnboard(page: Page, prefix: string) {
  const user = newUser(prefix)
  await register(page, user)
  await login(page, user.email, user.password)
  await completeOnboarding(page)
  await expect(page).toHaveURL(/\/transactions/, { timeout: 10000 })
  return user
}

// Feature 1.5 — Onboarding
test.describe('Onboarding', () => {
  test('new user is redirected to onboarding and can complete it', async ({ page }) => {
    const user = newUser('onb')
    await register(page, user)
    await login(page, user.email, user.password)

    // Brand-new user (no onboardingAt) → guard sends to onboarding.
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 })

    // Pick currency via the Shadcn Select, set month start + budget, submit.
    await page.getByRole('combobox').click()
    await page.getByRole('option', { name: 'EUR', exact: true }).click()
    await page.locator('input[type="number"]').first().fill('5')
    await page.locator('input[type="number"]').nth(1).fill('30000')
    await page.locator('button[type="submit"]').click()

    await expect(page).toHaveURL(/\/transactions/, { timeout: 10000 })
  })

  test('completed user visiting /onboarding is redirected to transactions', async ({ page }) => {
    await signUpAndOnboard(page, 'onb-done')

    await page.goto('/onboarding')
    await expect(page).toHaveURL(/\/transactions/, { timeout: 10000 })
  })
})

// Feature 1.6 — User profile (settings)
test.describe('Settings', () => {
  test('updates the name on the General tab and shows a success toast', async ({ page }) => {
    await signUpAndOnboard(page, 'set-name')

    await page.goto('/settings')
    const nameInput = page.getByPlaceholder(/enter your name/i)
    await nameInput.fill('Renamed User')
    await page.locator('button[type="submit"]').click()

    await expect(page.getByText('Settings saved!')).toBeVisible({ timeout: 5000 })
  })

  test('switches to the Statistics tab and persists currency + budget', async ({ page }) => {
    // Onboarded with EUR / budget 20000 (see completeOnboarding).
    await signUpAndOnboard(page, 'set-stats')

    await page.goto('/settings')

    // Tab switcher (Shadcn Tabs) → Statistics.
    await page.getByRole('tab', { name: /statistics/i }).click()

    // Change currency (Shadcn Select) and monthly budget (last number input).
    await page.getByRole('combobox').click()
    await page.getByRole('option', { name: 'PLN', exact: true }).click()
    await page.locator('input[type="number"]').last().fill('45000')
    await page.locator('button[type="submit"]').click()

    await expect(page.getByText('Settings saved!')).toBeVisible({ timeout: 5000 })

    // Persistence: reload, reopen the Statistics tab → values are retained.
    await page.goto('/settings')
    await page.getByRole('tab', { name: /statistics/i }).click()
    await expect(page.getByRole('combobox')).toContainText('PLN')
    await expect(page.locator('input[type="number"]').last()).toHaveValue('45000')
  })
})
