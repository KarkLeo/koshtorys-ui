import { test, expect } from '@playwright/test'

const TEST_USER = {
  name: 'E2E User',
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

  test('should show inline validation errors on blur', async ({ page }) => {
    await page.goto('/register')

    // name: blur empty → required
    await page.getByPlaceholder(/enter your name/i).click()
    await page.getByPlaceholder(/enter your email/i).click()
    await expect(page.getByText('Name is required')).toBeVisible()

    // name: too short → min length
    await page.getByPlaceholder(/enter your name/i).fill('ab')
    await page.getByPlaceholder(/enter your email/i).click()
    await expect(page.getByText('Name must be at least 3 characters')).toBeVisible()

    // email: invalid format
    await page.getByPlaceholder(/enter your email/i).fill('not-an-email')
    await page.locator('input[type="password"]').first().click()
    await expect(page.getByText('Invalid email format')).toBeVisible()

    // confirmPassword: mismatched
    await page.locator('input[type="password"]').first().fill('Password123!')
    await page.locator('input[type="password"]').nth(1).fill('different')
    await page.getByPlaceholder(/enter your name/i).click()
    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })

  test('should show email field error when registering with existing email', async ({ page }) => {
    const existingEmail = `dup-${Date.now()}@example.com`
    const password = 'TestPassword123!'

    // Register first user
    await page.goto('/register')
    await page.getByPlaceholder(/enter your name/i).fill('First User')
    await page.getByPlaceholder(/enter your email/i).fill(existingEmail)
    await page.locator('input[type="password"]').first().fill(password)
    await page.locator('input[type="password"]').nth(1).fill(password)
    await page.getByRole('button', { name: /submit|register|sign up/i }).click()
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })

    // Try to register again with the same email
    await page.goto('/register')
    await page.getByPlaceholder(/enter your name/i).fill('Second User')
    await page.getByPlaceholder(/enter your email/i).fill(existingEmail)
    await page.locator('input[type="password"]').first().fill(password)
    await page.locator('input[type="password"]').nth(1).fill(password)
    await page.getByRole('button', { name: /submit|register|sign up/i }).click()

    // Error in email field, not a toast — page stays on /register
    await expect(page.getByText('Email already exists')).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveURL(/\/register/)
  })

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByPlaceholder(/email/i).fill(TEST_USER.email)
    await page.locator('input[type="password"]').fill(TEST_USER.password)

    await page.getByRole('button', { name: /submit|login|sign in/i }).click()

    await expect(page).toHaveURL(/\/(transactions|onboarding)/, { timeout: 10000 })
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
    await expect(page).toHaveURL(/\/(transactions|onboarding)/, { timeout: 10000 })

    // Click logout button (last SVG button in header)
    await page.locator('header button:has(svg)').last().click()

    await expect(page).toHaveURL(/\/$/, { timeout: 10000 })
  })
})
