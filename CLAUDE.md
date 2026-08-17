# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Koshtorys is a home expense-tracking Vue 3 application with a distinctive approach to financial management:

- **Expense-only tracking**: No income tracking - focuses purely on managing expenses
- **Financial month concept**: Users set a custom month start day (e.g., payday). The financial month runs from that day to the same day next month minus one day
- **Month indexing rule**: If start day < 15, index matches the calendar month; if start day >= 15, index corresponds to the next calendar month
- **Budget tracking**: Users set a monthly budget representing salary or desired spending level
- **Multi-currency support**: Transactions can be in different currencies with exchange rate tracking
- **Bilingual**: Ukrainian and English interface

### Core Features

**Transactions:**
- Each transaction has: category (fixed set), date, currency, amount, optional description
- Can be edited, deleted
- Can be linked to planned expenses

**Planned Expenses (two types):**
1. **One-off plans**: Single planned transaction (e.g., "buy cabinet")
   - May have a specific date
   - Can be linked to a real transaction
2. **Dynamic plans**: Monthly target for a category (e.g., "food", "fuel")
   - Tracks all transactions in that category (excluding those linked to one-off plans)

Both plan types can be recurring (will appear in suggestions for next month).

**Statistics:**
- Category-based analytics with monthly averages
- Daily spending dynamics chart (cumulative sum by day)
- Planned vs spent metrics

## Development Commands

```bash
# Install dependencies
npm install

# Development server with hot reload
npm run dev

# Production build (runs type-check + build)
npm run build

# Type checking only
npm run type-check

# Lint and fix
npm run lint

# Format code
npm run format

# Regenerate REST API types from the running API's Swagger JSON
npm run generate:rest
```

## Architecture

### Tech Stack
- **Frontend**: Vue 3 with Composition API, TypeScript
- **State Management**: Pinia stores
- **Data Fetching**: Axios against the REST API (`src/api/`)
- **Routing**: Vue Router with authentication guards
- **Validation**: Yup schemas
- **I18n**: vue-i18n (Ukrainian/English)
- **Build Tool**: Vite
- **PWA**: vite-plugin-pwa with Workbox

### Project Structure

```
src/
├── api/             # REST layer: axios client, auth calls, services/, generated types.ts
├── assets/          # Static assets (CSS, images)
├── components/      # Vue components
│   ├── ui/          # Shadcn-vue primitives (button, dialog, drawer, select, …)
│   ├── kit/         # Legacy custom components (KitButton, KitModal, …) — being replaced by ui/
│   ├── icons/       # Icon components
│   ├── planning/    # Planning-specific components
│   ├── settings/    # Settings-specific components
│   ├── statistics/  # Statistics/charts components
│   └── transaction/ # Transaction-specific components
├── composables/     # Reusable composables (useGlobalAdd, useChartTheme)
├── constants/       # App constants (menu, currencies, categories, etc.)
├── helpers/         # Utility functions (date calculations, planning logic, category helpers)
├── hooks/           # Data hooks (auth-hooks, transaction-hooks, planning-rest-hooks, …)
├── i18n/            # Internationalization setup and locale files
├── layouts/         # Layout components
├── lib/             # Shadcn `cn()` helper
├── mappers/         # Data transformation functions
├── router/          # Vue Router configuration
├── stores/          # Pinia stores (userStore, transactionsStore, statisticDateStore)
├── validations/     # Yup validation schemas
└── views/           # Page-level components
```

### Key Patterns

**REST Integration:**
- Axios instance in `api/client.ts` (`baseURL: VITE_API_ENDPOINT`, `withCredentials: true`)
- Endpoint wrappers in `api/auth.ts` and `api/services/*.service.ts`
- `api/types.ts` is generated from the API's Swagger JSON — run `npm run generate:rest`
  with the API running on `localhost:3000`; never hand-edit it
- Failed responses carrying `errorCodes` are rethrown as `ApiError`

**Authentication:**
- JWT access/refresh tokens live in httpOnly cookies — the client never reads them,
  it just sends credentials with every request
- A 401 response interceptor calls `POST /auth/refresh` once, queues the concurrent
  requests, replays them on success, and redirects to `login` on failure
- Router guards in `router/index.ts` check auth state and onboarding completion
- Routes marked with `meta: { requiresAuth: true }` or `meta: { requiresNoAuth: true }`

**Financial Month Calculations:**
- Critical date logic in `helpers/date.ts`
- Functions account for custom month start day (1-31)
- Month index shifts by +1 when start day >= 15
- All date operations must use these helpers to maintain consistency

**State Management:**
- Pinia stores hold server state: `userStore` (current user), `transactionsStore`
  (per-month transaction cache), `statisticDateStore` (selected period)
- Hooks in `hooks/` wrap the stores and API services for components
- Toasts go through `vue-sonner`

**Component Library:**
- `components/ui/` — Shadcn-vue primitives (reka-ui based), the target for all new UI
- `components/kit/` — legacy custom "Kit*" components, replaced incrementally

**Validation:**
- Yup schemas in `validations/` directory
- Separate schemas for: login, register, onboarding, settings, transactions, plans

**I18n:**
- All user-facing strings must be in `i18n/locales/` (ua.json, en.json)
- Use `$t('key')` in templates or `t('key')` in composition API

### Environment Variables

Required in `.env`:
- `VITE_API_ENDPOINT`: REST API base URL (e.g. `http://localhost:3000/api`)

### Docker Deployment

Multi-stage Dockerfile:
1. Build stage: Node 22 Alpine, runs `npm ci` and `npm run build`
2. Runtime stage: nginx serving static files from `/usr/share/nginx/html`
3. Build arg: `VITE_API_ENDPOINT` must be provided at build time

### PWA Configuration

- Configured in `vite.config.ts` with VitePWA plugin
- Runtime caching for scripts, styles, and images
- Auto-updates on new version detection
- App name: "Koshtorys"

### Important Constants

- Transaction categories defined in `constants/transaction-categories.ts`
- Supported currencies in `constants/currencies.ts`
- Menu configuration in `constants/menu.ts`
- Onboarding version tracking in `constants/meta.ts` (forces re-onboarding when updated)

## Testing

Three layers, all configured in `vite.config.ts` / `playwright.config.ts`:

```bash
npx vitest run --project unit        # unit tests (src/**/*.test.ts, node env)
npx vitest run --project storybook   # story tests in a headless chromium
npx playwright test                  # e2e specs in e2e/ (needs API + DB running)
```

## Key Considerations

1. **Date handling is critical**: Always use helpers from `helpers/date.ts` when working with financial months
2. **Month start day affects everything**: All date calculations must account for user's custom month start day
3. **Type safety**: `src/api/types.ts` is generated from Swagger — regenerate with
   `npm run generate:rest` after API DTO changes instead of editing it
4. **Token management**: Authentication uses refresh token rotation - don't break the token refresh flow
5. **Onboarding version**: Updating `ONBOARDING_UPDATED_AT` forces all users to re-onboard
6. **Plan types matter**: One-off vs dynamic plans have different logic for calculating "spent" amounts
