// e2e/link-plan.spec.ts
/**
 * e2e: Link transaction to a one-off plan (Feature 2.5, wired to real data)
 *
 * Проверяет связку дизайна 2.5 с логикой на живом REST-API:
 *  1. Сид one-off (TRANSACTION) плана через REST POST /api/plans (в текущем фин. месяце).
 *  2. Открыть форму → "Planning" → выбрать план → "Save".
 *  3. Форма автозаполнилась (сумма/описание из плана), показан SelectedPlanCard.
 *  4. Сохранить → транзакция в списке с описанием плана.
 *  5. Переоткрыть форму → "Planning" → план ЗАДИЗЕЙБЛЕН (guard «уже связан»,
 *     корректен благодаря usePlanningList=cache-and-network).
 *
 * ВНИМАНИЕ: селекторы вложенных диалогов (форма + модалка) и состояние disabled
 * могут потребовать подгонки при первом живом прогоне (Task 4).
 */
import { test, expect, type Page } from '@playwright/test'

const API = 'http://localhost:3000/api'
const PASSWORD = 'TestPassword123!'

function newUser() {
  return {
    name: 'Link Plan E2E',
    email: `link-plan-${Date.now()}-${Math.floor(Math.random() * 9999)}@example.com`,
    password: PASSWORD,
  }
}

/** Register → login → onboarding (EUR, monthStartDay=1, budget) → /dashboard. */
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

/** Сид one-off (TRANSACTION) плана в текущем фин. месяце через REST. */
async function seedOneOffPlan(page: Page) {
  const now = new Date()
  const monthIndex = now.getMonth() + 1 // monthStartDay=1 (<15) → monthIndex = календарный месяц
  const year = now.getFullYear()
  const res = await page.request.post(`${API}/plans`, {
    data: {
      type: 'TRANSACTION',
      monthIndex,
      year,
      amount: 50,
      currency: 'EUR',
      categoryId: 'food--food-delivery',
      description: 'Sushi plan',
    },
  })
  expect(res.ok(), `seed plan failed: ${res.status()} ${await res.text()}`).toBeTruthy()
}

async function login(page: Page, user: { email: string; password: string }) {
  await page.goto('/login')
  await page.getByPlaceholder(/email/i).fill(user.email)
  await page.locator('input[type="password"]').fill(user.password)
  await page.getByRole('button', { name: /submit|login|sign in/i }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

test.describe.serial('Link transaction to one-off plan', () => {
  const user = newUser()

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await signUpAndOnboard(page, user)
    await seedOneOffPlan(page)
    await page.close()
  })

  test('link plan → autofill → create → plan becomes disabled', async ({ page }) => {
    await login(page, user)
    await expect(page.getByText('No transactions this month')).toBeVisible({ timeout: 8000 })

    // Открыть форму
    await page.getByRole('button', { name: /^\+\s*Add$/i }).click()
    const form = page.getByRole('dialog').filter({ hasText: 'Add new transaction' })
    await expect(form).toBeVisible({ timeout: 5000 })

    // Открыть модалку выбора плана
    await form.getByRole('button', { name: /^Planning$/i }).click()
    const modal = page.getByRole('dialog').filter({ hasText: 'Add Transaction' }).first()
    await expect(modal.getByText('Sushi plan')).toBeVisible({ timeout: 5000 })

    // Выбрать план (клик по строке) и сохранить
    await modal.getByText('Sushi plan').click()
    await modal.getByRole('button', { name: /^Save$/i }).click()

    // Форма автозаполнилась + SelectedPlanCard
    await expect(form.getByPlaceholder('00.00')).toHaveValue('50')
    await expect(form.getByText('Sushi plan')).toBeVisible()

    // Сохранить транзакцию
    await form.getByRole('button', { name: /^Add$/i }).click()

    // Карточка в списке
    await expect(page.getByText('Sushi plan')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('50 €')).toBeVisible({ timeout: 8000 })

    // Переоткрыть форму → Planning → план задизейблен (guard на свежем PLANNING)
    await page.getByRole('button', { name: /^\+\s*Add$/i }).click()
    const form2 = page.getByRole('dialog').filter({ hasText: 'Add new transaction' })
    await form2.getByRole('button', { name: /^Planning$/i }).click()
    const modal2 = page.getByRole('dialog').filter({ hasText: 'Add Transaction' }).first()
    // disabled-строка плана: RadioGroupItem disabled / label с классом disabled
    const planRow = modal2.locator('label', { hasText: 'Sushi plan' })
    await expect(planRow).toBeVisible({ timeout: 5000 })
    await expect(planRow.getByRole('radio')).toBeDisabled()
  })
})
