# Frontend Quality Refinement Plan

## Context

This plan captures the Quality Architect review of the frontend module on branch `codex/fix-login-dashboard-reload`.

The review used the `adversarial-test-architect` testing lens: prioritize edge cases, branch coverage, mutation resistance, realistic mocks, and automation gates that catch regressions instead of merely increasing line coverage.

## Current Baseline

- Unit/integration suite: 19 files, 82 tests, all passing.
- Vitest emitted React `act(...)` warnings in auth hook/integration tests.
- Coverage reporting is currently noisy because generated/build/test artifacts are included.
- Several Playwright dashboard tests contain tautological assertions such as `>= 0`, `body visible`, or `expect(true).toBe(true)`, which would let major regressions survive.

## Priority 0: Fix Coverage Instrumentation

Update `frontend/vitest.config.ts` so coverage excludes generated artifacts, build output, and tests themselves.

Recommended exclusions:

- `.next/**`
- `coverage/**`
- `public/mockServiceWorker.js`
- `__tests__/**`
- `**/*.test.*`
- `**/*.spec.*`
- `lib/types/**` if those files remain type-only

After the source-only coverage gaps below are closed, raise thresholds to 100% for statements, lines, functions, and branches.

## Priority 1: Missing Scenarios and Edge Cases

### Login and Auth Flow

Files:

- `frontend/app/(auth)/login/LoginForm.tsx`
- `frontend/__tests__/components/LoginForm.test.tsx`
- `frontend/e2e/auth.spec.ts`
- `frontend/__tests__/lib/utils/validators.test.ts`

Add tests for:

- Safe redirect handling:
  - `?returnTo=/orders` redirects to `/orders`.
  - `?returnTo=//evil.com`, `?returnTo=https://evil.com`, and `?returnTo=javascript:alert(1)` redirect to `/dashboard`.
- Non-`Error` login rejection:
  - Mock `authApi.login` rejecting with a string, object, or `null`.
  - Assert fallback text: `Login failed. Please try again.`
- Submit idempotency:
  - Double-click “Sign In” rapidly.
  - Assert only one `authApi.login` call, or assert the second click is blocked while submission is pending.
- Password boundary matrix:
  - Length 7 invalid.
  - Length 8 valid when all character classes are present.
  - Length 9 valid.
  - Include Unicode and structural payloads such as `Test123!😀`, `Test123!<script>`, and `' OR '1'='1` as passive text.
- Validator null/empty/type inversion:
  - Empty email/password.
  - Missing email/password.
  - `null` email/password.
  - Non-boolean `rememberMe`.

### Auth Storage and Session State

Files:

- `frontend/lib/auth/client.ts`
- `frontend/lib/auth/context.tsx`
- `frontend/__tests__/lib/auth/client.test.ts`
- `frontend/__tests__/lib/auth/context.test.tsx`

Add tests for:

- SSR/no-window branches for `login`, `getToken`, `getUser`, and `logout`.
- Corrupt `localStorage.user` JSON.
  - Preferred robust behavior: clear corrupt state and return `null`.
- `useAuth` outside `AuthProvider`.
  - Assert exact error: `useAuth must be used within AuthProvider`.
- Real `setSession` behavior through `AuthProvider`.
- Logout API failure semantics.
  - Decide whether local session should still clear if API logout fails. Preferred UX: clear local session so the user is not stranded logged in after a transient server/network error.

### API Client Behavior

Files:

- `frontend/lib/api/client.ts`
- `frontend/lib/api/auth.ts`
- `frontend/__tests__/lib/api/client.test.ts`

Add tests for:

- `ApiError` default message when a non-OK response lacks `message`.
- `error.name`, `status`, `data`, and fallback message `API Error`.
- Non-JSON or empty responses.
  - Current implementation assumes every response has JSON; tests should define controlled behavior.
- Custom base URL composition.
- Header merging:
  - Preserve custom `Authorization`.
  - Preserve JSON `Content-Type`.
- POST without body:
  - Assert no `body` property when body is `undefined`.
- `authApi.logout` with and without token:
  - Assert `Authorization` header is present only when token exists.

### Dashboard Data Loading

Files:

- `frontend/app/(dashboard)/dashboard/page.tsx`
- `frontend/__tests__/integration/dashboard-access.test.tsx`
- `frontend/e2e/dashboard.spec.ts`

Add tests for:

- Authenticated but missing token:
  - `isAuthenticated: true`, localStorage token absent.
  - Assert “Authentication required” and no fetch calls.
- Loading gates:
  - `authLoading: true` renders `Loading...` and does not fetch.
  - `mocksReady: false` does not fetch yet.
- Independent endpoint failures:
  - Orders fails while products/stats succeed.
  - Products fails while orders/stats succeed.
  - Stats fails while orders/products succeed.
  - In production mode, assert error state.
- Malformed payloads:
  - Empty object responses.
  - Missing or invalid stats fields.
  - Current validation checks `ordersThisMonth`; also validate `totalSpent` and `loyaltyPoints`.
- Development fallback vs production error:
  - In development, fetch failure uses dashboard mock data.
  - In production, the same failure displays an error.
- Retry button:
  - Click “Retry” and assert `window.location.reload` is called.

### Dashboard Cards and Shared Components

Files:

- `frontend/app/(dashboard)/dashboard/OrderCard.tsx`
- `frontend/app/(dashboard)/dashboard/ProductCard.tsx`
- `frontend/components/shared/Header.tsx`
- `frontend/components/ui/button.tsx`
- `frontend/components/ui/card.tsx`

Add tests for:

- `OrderCard` cancelled status badge.
- `OrderCard` unknown status fallback.
- Cancelled/unknown orders should not show shipped, delivered, or pending action buttons.
- `ProductCard` wishlist state:
  - Assert class changes from `text-gray-400` to `fill-red-500 text-red-500`.
  - Assert it toggles back.
- Rating boundaries:
  - `0`, `1`, `4.5`, `5`, negative, and greater than `5` if accepted by the component contract.
- Out-of-stock behavior:
  - `inStock` exists in the type but appears ignored.
  - Preferred behavior: disable “Add to Cart” and show “Out of stock”.
- `Header` anonymous user fallback:
  - `user: null` should display `User` and initial `U`.
- UI primitives:
  - `Button asChild`.
  - `CardDescription`.
  - `CardFooter`.

## Priority 2: Weak Tests and Mocks That Let Mutants Survive

### `frontend/e2e/dashboard.spec.ts`

Replace tautological assertions:

- `h1Count >= 0`
- `mainContent >= 0`
- body visibility as the only proof of success
- `expect(true).toBe(true)`
- button count `>= 0`

Use exact assertions for:

- dashboard heading
- order cards
- product cards
- stats cards
- route transitions
- wishlist interactions
- login → dashboard → reload persistence

### `frontend/__tests__/components/ProductCard.test.tsx`

The current wishlist test clicks the button but does not assert changed state. A mutant that removes `setIsWishlisted` would survive.

Strengthen the test by asserting visual state before click, after click, and after a second click.

### `frontend/__tests__/integration/dashboard-access.test.tsx`

Partial mocked `Response` objects omit `ok: true`, which can mask status-handling bugs.

Prefer MSW for integration tests. If mocking `fetch` directly, return real `Response` objects:

```ts
new Response(JSON.stringify(payload), { status: 200 })
```

### `frontend/__tests__/components/LoginForm.test.tsx`

Avoid redefining local versions of production classes such as `ApiError`. Import the real `ApiError` so constructor/name/status mutants are caught.

Also remove duplicate tests that assert the same happy path without adding branch coverage.

### `frontend/vitest.setup.ts`

Global `next/navigation` mocks plus per-test remocks can hide integration errors around route state and search params.

Prefer shared navigation mock helpers with explicit per-test setup.

## Path to 100% Unit Coverage

1. Fix `coverage.exclude` so only source files count.
2. Add direct tests for route, layout, and page components:
   - `frontend/app/(auth)/layout.tsx`
   - `frontend/app/(auth)/login/page.tsx`
   - `frontend/app/(dashboard)/layout.tsx`
   - `frontend/app/page.tsx`
   - `frontend/app/layout.tsx`, either covered with `next/font/google` mocked or excluded if treated as framework integration.
3. Cover branch gaps:
   - `LoginForm.tsx`: non-`Error` catch and safe/unsafe `returnTo`.
   - `dashboard/page.tsx`: token missing, loading gates, endpoint failures, malformed stats, production vs development catch, retry.
   - `msw-provider.tsx`: production, development success, Firefox dashboard bypass, worker failure, unsupported service workers, existing controller, controllerchange timeout.
   - `auth/client.ts`: SSR branches and malformed user JSON.
   - `auth/context.tsx`: `setSession`, `useAuth` outside provider, logout failure.
   - `api/auth.ts`: logout token/no-token.
   - `api/client.ts`: `ApiError` default message and non-JSON/empty responses.
   - `OrderCard.tsx`: cancelled and unknown statuses.
   - `Header.tsx`: null user fallback.
   - `button.tsx`: `asChild`.
   - `card.tsx`: `CardDescription` and `CardFooter`.
4. Add 100% thresholds only after the branch gaps are closed.

## Automation Improvements

Add explicit quality gates:

```bash
npm run lint
npm run test:coverage -- --run
npm run test:e2e
npm run test:visual
npm run build
```

Add mutation testing:

- Use StrykerJS for `lib/**`, `app/(auth)/**`, `app/(dashboard)/**`, and `components/**`.
- Start with an 80% mutation score threshold.
- Ratchet upward after the initial weak tests are replaced.
- Focus mutants:
  - `||` to `&&` in dashboard status handling.
  - Redirect guard condition changes.
  - Password regex removal.
  - Token header removal.
  - Wishlist state assignment removal.

Fail on unexpected React warnings:

- Fix existing `act(...)` warnings in auth hook/integration tests.
- Add a console error spy that fails tests on unexpected React warnings.

Replace arbitrary Playwright waits:

- Replace `waitForTimeout(...)` with role assertions, URL assertions, or explicit app readiness signals.

Use shared test data builders:

- `buildLoginResponse`
- `buildUser`
- `buildOrder`
- `buildProduct`
- `buildStats`

Strengthen MSW usage:

- Prefer MSW for integration tests over hand-written `global.fetch = vi.fn()`.
- If direct fetch mocks are necessary, return real `Response` instances with `ok`, `status`, and `json` semantics.

Expand E2E and accessibility coverage:

- Assert localStorage/session persistence after login and reload.
- When logout exists, assert token/user removal and protected-page redirect.
- Add authenticated dashboard axe scan.
- Add keyboard navigation coverage for header, search, cart, user menu, quick actions, and skip-link behavior.

## Immediate Execution Order

1. Fix coverage exclusions.
2. Replace tautological dashboard E2E assertions.
3. Strengthen `ProductCard`, `LoginForm`, and dashboard integration tests.
4. Add auth/session/API edge tests.
5. Add route/layout/page coverage.
6. Add automation gates and mutation testing.
7. Raise source coverage thresholds to 100%.

## Primary Risks

The biggest immediate quality risks are placeholder E2E assertions and weak state assertions. Even with high line coverage, the current suite would allow important defects to survive:

- broken dashboard sections
- removed wishlist state updates
- unsafe redirect guard changes
- incorrect endpoint failure handling
- missing token headers
- localStorage/session persistence regressions
