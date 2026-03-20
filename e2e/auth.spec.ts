import { test, expect } from '@playwright/test'

const TEST_USER = {
  name: `E2E Test ${Date.now()}`,
  email: `e2e-test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
}

test.describe('Authentication', () => {
  test('should register a new user', async ({ page }) => {
    await page.goto('/register')

    await page.getByPlaceholder(/name/i).first().fill(TEST_USER.name)
    await page.getByPlaceholder(/email/i).fill(TEST_USER.email)
    await page.locator('input[type="password"]').first().fill(TEST_USER.password)
    await page.locator('input[type="password"]').nth(1).fill(TEST_USER.password)

    await page.getByRole('button', { name: /submit|register|sign up/i }).click()

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByPlaceholder(/email/i).fill(TEST_USER.email)
    await page.locator('input[type="password"]').fill(TEST_USER.password)

    await page.getByRole('button', { name: /submit|login|sign in/i }).click()

    await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 10000 })
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByPlaceholder(/email/i).fill('wrong@example.com')
    await page.locator('input[type="password"]').fill('WrongPassword123!')

    await page.getByRole('button', { name: /submit|login|sign in/i }).click()

    await page.waitForTimeout(2000)

    const currentUrl = page.url()
    expect(currentUrl).toContain('/login')
  })

  test('should logout', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByPlaceholder(/email/i).fill(TEST_USER.email)
    await page.locator('input[type="password"]').fill(TEST_USER.password)
    await page.getByRole('button', { name: /submit|login|sign in/i }).click()
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 10000 })

    // Click logout button
    await page.locator('button:has(svg)').filter({ has: page.locator('svg') }).last().click()

    await expect(page).toHaveURL(/^\/$/, { timeout: 10000 })
  })
})
