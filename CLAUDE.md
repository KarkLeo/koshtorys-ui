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

# Generate GraphQL types from schema
npm run generate
```

## Architecture

### Tech Stack
- **Frontend**: Vue 3 with Composition API, TypeScript
- **State Management**: Pinia stores (minimal usage)
- **Data Fetching**: Apollo Client with GraphQL
- **Routing**: Vue Router with authentication guards
- **Validation**: Yup schemas
- **I18n**: vue-i18n (Ukrainian/English)
- **Build Tool**: Vite
- **PWA**: vite-plugin-pwa with Workbox

### Project Structure

```
src/
├── @types/          # TypeScript type definitions
├── assets/          # Static assets (CSS, images)
├── components/      # Vue components
│   ├── kit/         # Reusable UI components (KitButton, KitModal, KitDatePicker, etc.)
│   ├── icons/       # Icon components
│   ├── planning/    # Planning-specific components
│   ├── settings/    # Settings-specific components
│   ├── statistics/  # Statistics/charts components
│   └── transaction/ # Transaction-specific components
├── constants/       # App constants (menu, currencies, categories, etc.)
├── graphql/         # GraphQL queries/mutations (.graphql files) and generated types
├── helpers/         # Utility functions (date calculations, planning logic, category helpers)
├── hooks/           # Vue composables (auth-hooks, transaction-hooks, planning-hooks)
├── i18n/            # Internationalization setup and locale files
├── layouts/         # Layout components
├── mappers/         # Data transformation functions
├── router/          # Vue Router configuration
├── services/        # Business logic services (auth-service, tokens-service)
├── stores/          # Pinia stores (toastStore, statisticDateStore)
├── validations/     # Yup validation schemas
└── views/           # Page-level components
```

### Key Patterns

**GraphQL Integration:**
- GraphQL schema and queries live in `src/graphql/`
- Code generation via `@graphql-codegen/cli` creates TypeScript types in `src/graphql/types.ts`
- Run `npm run generate` after schema changes to update types
- Apollo Client configured in `apolloClient.ts` with:
  - Automatic token refresh on UNAUTHENTICATED errors
  - Auth link that adds Bearer tokens to requests
  - Error handling link for GraphQL errors

**Authentication:**
- JWT tokens stored in localStorage via `TokensService`
- Router guards in `router/index.ts` check auth state and onboarding completion
- Automatic token refresh logic in `apolloClient.ts` handles expired access tokens
- Routes marked with `meta: { requiresAuth: true }` or `meta: { requiresNoAuth: true }`

**Financial Month Calculations:**
- Critical date logic in `helpers/date.ts`
- Functions account for custom month start day (1-31)
- Month index shifts by +1 when start day >= 15
- All date operations must use these helpers to maintain consistency

**State Management:**
- Minimal Pinia usage (toast notifications, statistic date selection)
- Most state managed via Apollo Client cache and Vue Composition API refs

**Component Library ("Kit"):**
- Custom component library in `components/kit/`
- Prefixed with "Kit" (KitButton, KitModal, KitInput, etc.)
- Not using any external component library (custom-built)

**Validation:**
- Yup schemas in `validations/` directory
- Separate schemas for: login, register, onboarding, settings, transactions, plans

**I18n:**
- All user-facing strings must be in `i18n/locales/` (ua.json, en.json)
- Use `$t('key')` in templates or `t('key')` in composition API

### Environment Variables

Required in `.env`:
- `VITE_GRAPHQL_ENDPOINT`: GraphQL API endpoint URL

### Docker Deployment

Multi-stage Dockerfile:
1. Build stage: Node 22 Alpine, runs `npm ci` and `npm run build`
2. Runtime stage: nginx serving static files from `/usr/share/nginx/html`
3. Build arg: `VITE_GRAPHQL_ENDPOINT` must be provided at build time

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

Tests use Vitest (configured but minimal coverage currently).
Run tests with:
```bash
npm run test
```

## Key Considerations

1. **Date handling is critical**: Always use helpers from `helpers/date.ts` when working with financial months
2. **Month start day affects everything**: All date calculations must account for user's custom month start day
3. **Type safety**: GraphQL types are auto-generated - regenerate after schema changes
4. **Token management**: Authentication uses refresh token rotation - don't break the token refresh flow
5. **Onboarding version**: Updating `ONBOARDING_UPDATED_AT` forces all users to re-onboard
6. **Plan types matter**: One-off vs dynamic plans have different logic for calculating "spent" amounts
