/**
 * e2e: Plan create / edit / delete on REST (block 3B, Task 11)
 *
 * Scenario:
 *  1. Register + onboard a fresh user (EUR, budget 3400, monthStartDay 1).
 *  2. Create a dynamic (CATEGORY) plan through the "+ Add plan" drawer, assert
 *     the resulting card, edit its amount, then delete it via the AlertDialog
 *     confirmation.
 *  3. Create a one-off (TRANSACTION) plan with a description.
 *  4. Assert a one-off plan submitted without a description is rejected
 *     client-side (no round-trip to the API — the message is a yup error).
 *
 * Selector notes (verified against the running app, see task-11 brief corrections):
 *  - "+ Add plan" button: `getByRole('button', { name: /add plan/i })`.
 *  - The drawer renders as a shadcn `Dialog` on desktop viewports (>=768px,
 *    the Playwright default) — scope queries to `getByRole('dialog')`.
 *  - `CategoryPicker`'s trigger is NOT role="combobox": reka-ui's
 *    `ComboboxTrigger` renders a plain `<button>` with a hardcoded
 *    `aria-label="Show popup"` (see node_modules/reka-ui/src/Combobox/
 *    ComboboxTrigger.vue) regardless of the visible "Select category" text —
 *    so `getByRole('combobox', ...)` never matches it. `MoneyInput`'s
 *    currency `Select` DOES render role="combobox" (its accessible name is
 *    the current currency code), so the two never collide in practice.
 *  - Category options are translated as "<Group>:  <Name>" (double space,
 *    see i18n/locales/en.json), so exact-match option lookups fail; match by
 *    substring instead.
 *  - Plan type toggle items are buttons named "One-time expense" /
 *    "Dynamic budget" (`planning.form.type.*`).
 *  - PlanCard's Edit/Delete live behind a DropdownMenu, not as flat icon buttons:
 *    the trigger is a button labelled "Plan actions" (`planning.actions.menu`) and
 *    the entries are `menuitem`s. Use `openPlanMenu()` below.
 */

import { test, expect, type Page } from '@playwright/test'

const PASSWORD = 'TestPassword123!'

function newUser() {
  return {
    name: 'Plan CRUD E2E',
    email: `plan-crud-${Date.now()}-${Math.floor(Math.random() * 9999)}@example.com`,
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

/**
 * Picks a category via the combobox. The trigger lives inside the dialog,
 * but reka-ui teleports the option list (`ComboboxPortal`) to `document.body`,
 * so the listbox itself must be queried at the page level, not scoped to the
 * dialog locator.
 */
async function pickCategory(
  page: Page,
  dialog: ReturnType<Page['getByRole']>,
  optionSubstring: string,
) {
  await dialog.getByRole('button', { name: 'Show popup' }).click()
  await page.getByRole('option', { name: new RegExp(optionSubstring, 'i') }).click()
}

/**
 * Opens a PlanCard's action dropdown and waits for the menu to be on screen.
 * The menu content is portalled to the body, so the returned menu items are
 * looked up on `page`, not inside the card's locator.
 */
async function openPlanMenu(page: Page, card: ReturnType<Page['locator']>) {
  await card.getByRole('button', { name: 'Plan actions' }).first().click()
  await expect(page.getByRole('menu')).toBeVisible({ timeout: 5000 })
}

test.describe.serial('Plan create / edit / delete on REST', () => {
  const user = newUser()

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await signUpAndOnboard(page, user)
    await page.close()
  })

  test('creates, edits and deletes a dynamic plan', async ({ page }) => {
    await login(page, user)

    await page.getByRole('link', { name: 'Planning' }).click()
    await expect(page).toHaveURL(/\/planning/, { timeout: 10000 })

    // --- create ---------------------------------------------------------
    await page.getByRole('button', { name: /add plan/i }).click()
    const addDialog = page.getByRole('dialog')
    await expect(addDialog).toBeVisible({ timeout: 5000 })

    await addDialog.getByRole('button', { name: 'Dynamic budget' }).click()
    await addDialog.locator('input[type="number"]').first().fill('200')
    await pickCategory(page, addDialog, 'Groceries')
    await addDialog.getByRole('button', { name: /^Add$/ }).click()

    await expect(addDialog).toBeHidden({ timeout: 10000 })

    const foodGroup = page.locator('.rounded-xl.border', { hasText: 'Food' })
    await expect(foodGroup).toBeVisible({ timeout: 10000 })
    await expect(foodGroup.getByText('200 €').first()).toBeVisible()

    // --- edit -----------------------------------------------------------
    await openPlanMenu(page, foodGroup)
    await page.getByRole('menuitem', { name: 'Edit' }).click()
    const editDialog = page.getByRole('dialog')
    await expect(editDialog).toBeVisible({ timeout: 5000 })
    await editDialog.locator('input[type="number"]').first().fill('350')
    await editDialog.getByRole('button', { name: /^Update$/ }).click()
    await expect(editDialog).toBeHidden({ timeout: 10000 })

    await expect(foodGroup.getByText('350 €').first()).toBeVisible({ timeout: 10000 })
    await expect(foodGroup.getByText('200 €')).toHaveCount(0)

    // --- delete -----------------------------------------------------------
    // The confirmation is scoped to `alertdialog` because its own action button is
    // also named "Delete" — an unscoped lookup would be ambiguous.
    await openPlanMenu(page, foodGroup)
    await page.getByRole('menuitem', { name: 'Delete' }).click()
    const confirmDialog = page.getByRole('alertdialog')
    await expect(confirmDialog.getByText('Delete plan?')).toBeVisible()
    await confirmDialog.getByRole('button', { name: /^Delete$/ }).click()
    await expect(page.locator('.rounded-xl.border', { hasText: 'Food' })).toBeHidden({
      timeout: 10000,
    })
  })

  test('creates a one-off plan with description', async ({ page }) => {
    await login(page, user)
    await page.goto('/planning')

    await page.getByRole('button', { name: /add plan/i }).click()
    const addDialog = page.getByRole('dialog')
    await expect(addDialog).toBeVisible({ timeout: 5000 })

    // "One-time expense" is the default type.
    await addDialog.locator('input[type="number"]').first().fill('120')
    await addDialog.getByPlaceholder(/enter description/i).fill('New laptop')
    await pickCategory(page, addDialog, 'Groceries')
    await addDialog.getByRole('button', { name: /^Add$/ }).click()

    await expect(addDialog).toBeHidden({ timeout: 10000 })
    await expect(page.getByText('New laptop')).toBeVisible({ timeout: 10000 })
  })

  test('rejects a one-off plan without a description', async ({ page }) => {
    await login(page, user)
    await page.goto('/planning')

    await page.getByRole('button', { name: /add plan/i }).click()
    const addDialog = page.getByRole('dialog')
    await expect(addDialog).toBeVisible({ timeout: 5000 })

    await addDialog.locator('input[type="number"]').first().fill('50')
    await pickCategory(page, addDialog, 'Restaurants')
    await addDialog.getByRole('button', { name: /^Add$/ }).click()

    // Client-side yup validation rejects the submit: the drawer stays open
    // and the field-level error renders instead of a new plan appearing.
    await expect(addDialog.getByText('Description is required')).toBeVisible()
    await expect(addDialog).toBeVisible()
  })
})
