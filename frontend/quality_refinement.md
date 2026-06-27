# Frontend Quality Refinement — Findings & Plan

**Date:** 2026-06-27  
**Scope:** Next.js 15 frontend — unit, integration, and E2E test coverage; CI quality automation  
**Method:** Adversarial Test Architect review (boundary value analysis, mutation coverage, security payloads, idempotency)

---

## Executive Summary

Three critical compounding problems were found:

1. **Coverage numbers are misleading** — `collectCoverageFrom` is absent in `vitest.config.ts`, so 13 source files with zero tests are invisible to coverage reporting. The dashboard shows 80%+ green while large auth-critical paths have zero tests.
2. **High-risk code paths are untested** — 423 account-locked login, open-redirect prevention in `LoginForm`, `DashboardPage` error/null-token states, `AuthContext.setSession()`, `authClient` SSR guards, and `AuthContext.logout()` failure recovery.
3. **CI quality gates are broken** — visual regression baselines are macOS-only (always fail on Linux), `test:visual` npm script uses a grep string (`@visual`) that matches zero tests, no `eslint-plugin-testing-library`, no security scanning, no bundle size gate.

---

## Current State Inventory

### Source Files

| File | Purpose |
|---|---|
| `app/layout.tsx` | Root layout — wraps `MSWProvider` + `AuthProvider` |
| `app/page.tsx` | Stub home page (unwired inputs) |
| `app/msw-provider.tsx` | `MSWProvider` + `useMSW()` — guards against MSW startup race |
| `app/(auth)/layout.tsx` | Auth group layout (animated gradient background) |
| `app/(auth)/login/page.tsx` | `LoginPage` — two-column marketing + `LoginForm` |
| `app/(auth)/login/LoginForm.tsx` | Login form — react-hook-form + zod + `authApi.login()` + returnTo redirect |
| `app/(dashboard)/layout.tsx` | Dashboard layout — `Header` + `Footer` shell |
| `app/(dashboard)/dashboard/page.tsx` | `DashboardPage` — protected, fetches orders/products/stats via bare `fetch()` |
| `app/(dashboard)/dashboard/OrderCard.tsx` | Single order display with status badge + action buttons |
| `app/(dashboard)/dashboard/ProductCard.tsx` | Single product display with wishlist toggle |
| `app/(dashboard)/dashboard/StatsCard.tsx` | User stats (orders, spend, loyalty points) |
| `app/(dashboard)/dashboard/QuickActions.tsx` | 4-button quick-action grid |
| `components/shared/Header.tsx` | Sticky nav — reads `user` from `useAuth()` |
| `components/shared/Footer.tsx` | Static footer |
| `components/ui/{button,input,card,badge}.tsx` | shadcn/ui primitives |
| `lib/api/config.ts` | `API_CONFIG` — baseURL, authService path, timeout |
| `lib/api/client.ts` | `ApiClient` class + `ApiError` + singleton `apiClient` |
| `lib/api/auth.ts` | `authApi` — `login()`, `logout()`, `validate()` |
| `lib/auth/client.ts` | `authClient` — localStorage persistence (token + user) with SSR guards |
| `lib/auth/context.tsx` | `AuthProvider` / `useAuth()` — context with `login`, `setSession`, `logout`, `isLoading` |
| `lib/hooks/useAuth.ts` | Re-export barrel for `useAuth` |
| `lib/hooks/useProtectedRoute.ts` | Redirects to `/login?returnTo=` when unauthenticated |
| `lib/types/auth.ts` | `LoginRequest`, `LoginResponse`, `User`, `AuthError` |
| `lib/types/order.ts` | `OrderStatus`, `OrderItem`, `Order`, `OrderSummary` |
| `lib/types/product.ts` | `Product`, `UserStats`, `Notification` |
| `lib/utils.ts` | `cn()` — clsx + tailwind-merge |
| `lib/utils/validators.ts` | `loginSchema` (zod) + `LoginFormData` |

### Notable Architecture Observations

- **Two login code paths**: `LoginForm` calls `authApi.login()` directly then `setSession()`. `AuthContext.login()` also calls `authApi.login()` internally. The context method is unused by the UI — exists as a parallel unmaintained path.
- **Dashboard bypasses `apiClient`**: `DashboardPage` uses bare `fetch()` with `localStorage.getItem('token')` directly, not the `apiClient` singleton — two inconsistent API styles.
- **`framer-motion` installed but unused** — dead dependency, adds bundle weight.
- **`typescript` in `dependencies`** (not `devDependencies`) — non-standard, adds to production bundle.

### MSW Handlers (Full List)

| Method | Route | Scenarios |
|---|---|---|
| POST | `/api/v1/auth/login` | 200 success, 423 locked (`locked@example.com`), 401 invalid |
| POST | `/api/v1/auth/logout` | 200 always |
| GET | `/api/v1/auth/validate` | 200 valid token, 401 invalid |
| GET | `/api/v1/orders` | 200 (3 orders) if valid bearer, 401 otherwise |
| GET | `/api/v1/products/recommendations` | 200 (2 products) if valid bearer, 401 otherwise |
| GET | `/api/v1/users/stats` | 200 (stats object) if valid bearer, 401 otherwise |

Missing MSW handlers: registration, password reset, token refresh, product catalog/search, cart, checkout, 5xx errors, network failures for data endpoints.

---

## Current Test Inventory

### Unit / Integration Tests (Vitest)

| File | Tests |
|---|---|
| `__tests__/components/Footer.test.tsx` | renders copyright, navigation links |
| `__tests__/components/Header.test.tsx` | logo, search, cart badge, notifications, user avatar |
| `__tests__/components/LoginForm.test.tsx` | renders, submit, toggle, API call, validation errors, 401 banner, retry |
| `__tests__/components/OrderCard.test.tsx` | number, date, shipped badge, count, price, Track/BuyAgain/CompletePayment buttons |
| `__tests__/components/ProductCard.test.tsx` | name, description, price, rating, add-to-cart, wishlist toggle |
| `__tests__/components/QuickActions.test.tsx` | 4 buttons, animation classes |
| `__tests__/components/StatsCard.test.tsx` | title, orders, spent, loyalty points |
| `__tests__/hooks/useAuth.test.tsx` | returns context, login(), logout() |
| `__tests__/hooks/useProtectedRoute.test.tsx` | no redirect when authed, redirect when not authed, no redirect while loading |
| `__tests__/integration/dashboard-access.test.tsx` | authed sees dashboard, unauthed redirects, login → access, MSW race condition |
| `__tests__/integration/login-complete-flow.test.tsx` | full flow form→API→context→redirect, error→retry→success |
| `__tests__/integration/login-flow.test.tsx` | full login, login failure |
| `__tests__/lib/api/auth.test.ts` | login success/failure, logout, validate |
| `__tests__/lib/api/client.test.ts` | GET, POST, 401 error |
| `__tests__/lib/api/config.test.ts` | baseURL, authService, timeout |
| `__tests__/lib/auth/client.test.ts` | save token/user, getToken, getUser, isAuthenticated, logout |
| `__tests__/lib/auth/context.test.tsx` | provides state, reads localStorage on mount |
| `__tests__/lib/types/auth.test.ts` | type shape assertions |
| `__tests__/lib/utils/validators.test.ts` | valid data, invalid email, missing uppercase/lowercase/digit/special char, too short |

### E2E Tests (Playwright — 5 browsers)

| File | Tests |
|---|---|
| `e2e/auth.spec.ts` | login success, invalid credentials, password toggle, remember-me, validation errors, keyboard nav, skip link |
| `e2e/dashboard.spec.ts` | redirect unauthed, load authed, welcome message, quick actions, orders section, products section, stats, page reload, **2 placeholders** (`expect(true).toBe(true)`), clickable actions, wishlist toggle |
| `e2e/accessibility.spec.ts` | axe scan, label association, error announcements, focus indicators, color contrast, keyboard completion, orbs hidden from screen reader |
| `e2e/visual/login.visual.spec.ts` | desktop/mobile/tablet views, validation errors, API error banner, loading state, password visible |
| `e2e/visual/dashboard.visual.spec.ts` | desktop/mobile/tablet, scrolled state, loading skeleton, mobile landscape, dark mode |
| `e2e/visual/responsive.visual.spec.ts` | 7 breakpoints (320→1920) |

---

## Coverage Gaps (Prioritized)

### Source Files with ZERO Coverage

| File | Risk |
|---|---|
| `app/(dashboard)/dashboard/page.tsx` | **High** — auth guard, null-token check, fetch error states |
| `app/msw-provider.tsx` | **High** — always mocked, real transitions never tested |
| `app/page.tsx` | Low — stub |
| `app/(auth)/login/page.tsx` | Low — pure layout |
| `app/(auth)/layout.tsx` | Low — pure layout |
| `app/(dashboard)/layout.tsx` | Low — pure layout |
| `components/ui/badge.tsx` | Low — shadcn primitive |
| `components/ui/button.tsx` | Low — shadcn primitive |
| `components/ui/card.tsx` | Low — shadcn primitive |
| `components/ui/input.tsx` | Low — shadcn primitive |
| `lib/utils.ts` | Low — 4-line cn() utility |

### Missing Test Cases (by category)

**Auth security (critical):**
- `authApi.validate()` with invalid/expired token (401 MSW handler exists, no test)
- `authApi.login()` with locked account (423 MSW handler exists, no test)
- `authApi.login()` with SQL injection payload in email
- `authApi.login()` with XSS payload in password
- `authApi.logout()` sends `Authorization: Bearer` header (side-effect never verified)
- `authApi.login()` idempotency (called twice, no duplicate side-effects)
- `AuthContext.setSession()` — direct method test (only exercised via mocks)
- `AuthContext.logout()` when `authApi.logout()` throws — user state must still clear
- `useAuth()` throws when called outside `AuthProvider`
- `authClient` SSR guards — `getToken()`, `getUser()`, `isAuthenticated()` when `window === undefined`
- `authClient.logout()` safe to call twice (idempotency)

**LoginForm edge cases:**
- Loading state: button = "Signing in...", fields disabled during submission
- `returnTo=/dashboard` → redirects correctly
- `returnTo=//evil.com` → rejected, falls back to `/dashboard` (open-redirect prevention)
- `returnTo=` empty → falls back to `/dashboard`
- 423 locked account shows locked-account specific message (not generic 401 banner)
- Empty email submit: shows "Email is required"
- Empty password submit: shows "Password is required"
- Password boundary: exactly 8 chars with all requirements → passes (B-exact)
- Password boundary: 7 chars → fails (B-1)

**DashboardPage (entirely untested):**
- Happy path: renders orders, products, stats when all fetches succeed
- Null-token guard: no token → shows "Authentication required" error
- Orders fetch 500 → error banner + retry button visible
- All three fetches fail → full error state
- Data fetch skipped when `mswReady` is false
- Retry button re-triggers fetch
- Orders fetch sends `Authorization: Bearer` header
- Empty orders array renders gracefully
- Empty products array renders gracefully

**Component gaps:**
- `OrderCard` with `cancelled` status (4th `OrderStatus` value)
- `OrderCard` with `processing` status
- `Header` with `user = null` (unauthenticated state)
- `ProductCard` with `inStock: false`

**Validators boundary (BVA):**
- Empty email (`""`) → "Email is required"
- Empty password (`""`) → "Password is required"
- Password exactly 8 chars with all rules → passes
- Password 7 chars → fails
- Password 9 chars → passes
- Email with multi-byte emoji → explicit assertion

**E2E missing scenarios:**
- 423 account-locked login → user sees locked message
- Logout flow → redirect to `/login`, localStorage cleared
- Open-redirect: `?returnTo=//evil.com` → `/dashboard`
- Session persistence: refresh page while logged in → stays authenticated
- API error state: network failure during dashboard fetch → error banner visible
- No-token mid-session: localStorage cleared → redirect to login
- Back-button after logout cannot access dashboard

**Configuration bugs:**
- `vitest.config.ts`: no `collectCoverageFrom` → untested files invisible to coverage
- `playwright.config.ts`: no `snapshotPathTemplate` → darwin-only baselines fail on Linux CI
- `package.json`: `test:visual` uses `--grep @visual` but zero tests match this string

---

## Proposed Changes

### 1. Fix Coverage Infrastructure

**`frontend/vitest.config.ts`**

```ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.config.*',
    '!**/node_modules/**',
    '!**/mocks/**',
    '!app/layout.tsx',
    '!app/(auth)/layout.tsx',
    '!app/(dashboard)/layout.tsx',
  ],
  exclude: ['node_modules/', 'vitest.setup.ts', '**/*.config.*', '**/*.d.ts', '**/mocks/**', 'e2e/**'],
  thresholds: { lines: 90, functions: 85, branches: 85, statements: 90 },
}
```

### 2. New / Extended Unit Tests

All new tests follow the adversarial matrix: happy path → boundary (B-1/B/B+1) → invalid type → null/empty → security payload → explicit error type.

| File | Action | New tests |
|---|---|---|
| `__tests__/lib/api/auth.test.ts` | Extend | 401 validate, 423 login, injection payloads, logout header, idempotency |
| `__tests__/lib/auth/client.test.ts` | Extend | SSR guards (×3), null getUser, idempotent logout |
| `__tests__/lib/auth/context.test.tsx` | Extend | setSession(), logout-throws recovery, outside-provider throw, isLoading transition |
| `__tests__/components/LoginForm.test.tsx` | Extend | loading state, returnTo validation, 423, empty fields, BVA passwords |
| `__tests__/components/DashboardPage.test.tsx` | **New** | 10 tests — happy path, null token, 500 errors, retry, empty collections |
| `__tests__/components/MSWProvider.test.tsx` | **New** | mswReady state, dev vs prod, outside-provider throw |
| `__tests__/components/OrderCard.test.tsx` | Extend | cancelled status, processing status |
| `__tests__/components/Header.test.tsx` | Extend | null user → "U" initial |
| `__tests__/lib/utils/validators.test.ts` | Extend | empty email/password, BVA 7/8/9 chars, emoji payload |
| `__tests__/lib/utils.test.ts` | **New** | cn() — merge, undefined, empty args |
| `__tests__/fixtures/index.ts` | **New** | Shared `makeOrder`, `makeProduct`, `makeUser`, `makeStats` factories |

### 3. Extend MSW Handlers

**`frontend/mocks/handlers.ts`** — add named `errorHandlers` export:

```ts
export const errorHandlers = {
  ordersNetworkError: http.get('/api/v1/orders', () => HttpResponse.error()),
  ordersServerError: http.get('/api/v1/orders', () => HttpResponse.json({}, { status: 500 })),
  productsServerError: http.get('/api/v1/products/recommendations', () => HttpResponse.json({}, { status: 500 })),
  statsServerError: http.get('/api/v1/users/stats', () => HttpResponse.json({}, { status: 500 })),
};
```

Tests call `server.use(errorHandlers.ordersNetworkError)` for failure scenarios.

### 4. Fix and Strengthen E2E

**`e2e/dashboard.spec.ts`:**
- Replace 2 placeholder `expect(true).toBe(true)` tests with real assertions (hover state, aria-pressed on wishlist)
- Rewrite 5 weak non-assertions (`>= 0`, `isVisible()`) with actual content assertions against MSW data

**`e2e/auth.spec.ts`** — add 5 new scenarios:
- Account-locked (423) shows locked message
- Logout → `/login`, localStorage cleared
- `?returnTo=//evil.com` → lands on `/dashboard`
- Session persistence through page refresh
- Error banner disappears on successful retry

**`e2e/dashboard.spec.ts`** — add 3 new scenarios:
- Network failure → error banner visible
- localStorage cleared mid-session → redirect to login
- Back-button post-logout → cannot access dashboard

### 5. Fix CI Bugs

**`frontend/playwright.config.ts`:**
```ts
snapshotPathTemplate: '{testDir}/visual/{arg}-snapshots/{testFilePath}/{arg}{ext}'
```
Strips OS from snapshot filenames so macOS and Linux share baselines.

**`frontend/package.json`:**
```json
"test:visual": "playwright test e2e/visual/"
```
Replaces broken `--grep @visual` with a direct path target.

### 6. Quality Automation

**Install:** `eslint-plugin-testing-library`, `eslint-plugin-jest-dom`

**`frontend/eslint.config.mjs`** — add rules:
- `testing-library/no-await-sync-events`
- `testing-library/no-unnecessary-act`
- `testing-library/prefer-screen-queries`
- `testing-library/no-render-in-setup`
- `jest-dom/prefer-to-have-value`
- `jest-dom/prefer-in-document`

**`.github/workflows/frontend-ci.yml`** — add gates:
- `npm audit --audit-level=high` (security)
- Coverage summary posted to PR via `$GITHUB_STEP_SUMMARY`
- Linux visual baseline generation step (or commit Linux PNGs)
- Bundle size check after `npm run build`

---

## File Change Summary

| File | Change type |
|---|---|
| `frontend/vitest.config.ts` | Modify — add collectCoverageFrom, raise thresholds |
| `frontend/__tests__/lib/api/auth.test.ts` | Extend — 6 new adversarial tests |
| `frontend/__tests__/lib/auth/client.test.ts` | Extend — SSR guards + idempotency |
| `frontend/__tests__/lib/auth/context.test.tsx` | Extend — setSession, logout-throws, outside-provider |
| `frontend/__tests__/components/LoginForm.test.tsx` | Extend — loading, returnTo, 423, BVA |
| `frontend/__tests__/components/DashboardPage.test.tsx` | **New** |
| `frontend/__tests__/components/MSWProvider.test.tsx` | **New** |
| `frontend/__tests__/components/OrderCard.test.tsx` | Extend — cancelled + processing |
| `frontend/__tests__/components/Header.test.tsx` | Extend — null user |
| `frontend/__tests__/lib/utils/validators.test.ts` | Extend — BVA + empty + security |
| `frontend/__tests__/lib/utils.test.ts` | **New** |
| `frontend/__tests__/fixtures/index.ts` | **New** — shared data factories |
| `frontend/mocks/handlers.ts` | Extend — errorHandlers export |
| `frontend/e2e/auth.spec.ts` | Extend — 5 new scenarios |
| `frontend/e2e/dashboard.spec.ts` | Fix 2 placeholders + 5 weak assertions + 3 new |
| `frontend/playwright.config.ts` | Fix snapshotPathTemplate |
| `frontend/package.json` | Fix test:visual; add eslint-plugin-testing-library |
| `frontend/eslint.config.mjs` | Add testing-library + jest-dom rules |
| `.github/workflows/frontend-ci.yml` | Add npm audit, coverage summary, bundle gate |

---

## Verification Commands

```bash
cd frontend

# Verify true coverage (collectCoverageFrom now includes all source files)
npm run test:coverage

# All unit + integration tests pass
npm test

# E2E — all placeholders gone, all assertions meaningful
npm run test:e2e

# Visual suite — path-based, not broken grep
npm run test:visual

# ESLint with testing-library rules
npm run lint

# Security gate
npm audit --audit-level=high
```

**Expected outcomes after all changes:**
- Coverage thresholds enforced at 90/85/85/90 and actually passing
- All 13 previously invisible source files appear in coverage report
- Zero `expect(true).toBe(true)` placeholders remain
- `test:visual` executes the 3 visual spec files
- Visual baselines work on Linux CI
- `npm audit` passes as a required CI gate
