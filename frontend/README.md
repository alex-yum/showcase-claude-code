# ShopHub Frontend

Luxury e-commerce platform built with Next.js 15.

## ⚠️ Security Warning

**Current Implementation Uses localStorage for JWT Tokens**

This is a **temporary MVP solution only**. localStorage is vulnerable to XSS attacks - if an attacker injects malicious JavaScript, they can steal tokens.

**Mitigation Timeline:**
- **Current (MVP):** localStorage with input sanitization
- **Next Sprint:** Migrate to HTTP-only cookies when API Gateway is ready
- HTTP-only cookies are immune to XSS token theft

**DO NOT deploy to production without security review and migration to HTTP-only cookies.**

## Test Credentials

For MSW mocked authentication:
- **Email**: test@example.com
- **Password**: Test123!@#

## Implementation Status

### ✅ Part A: Infrastructure + Auth System (Complete)
- Next.js 15 + TypeScript + Tailwind setup
- shadcn/ui components (Button, Input)
- MSW mocking infrastructure
- Auth API client (authApi.login/logout/validate)
- Auth context (AuthProvider, useAuth)
- Route protection (useProtectedRoute)
- Zod validation schemas
- Test infrastructure (Vitest, Playwright)

### ✅ Part B: Login Page + Tests (Complete)
- Auth layout with luxury background and floating orbs
- Login page with two-column responsive layout
- LoginForm component with React Hook Form + Zod
- Password visibility toggle
- Remember me checkbox
- API error handling (401 banner)
- Full test coverage:
  - Unit tests (51 tests)
  - Integration tests (2 tests)
  - E2E tests (7 tests)
  - Accessibility tests (7 tests)
  - Visual regression tests (7 baseline screenshots)

### Part C: Dashboard + Tests ✅

**Status:** Complete

**Components:**
- Protected dashboard page with route guard
- Header component with search, cart, notifications, user menu
- Footer component with navigation links
- OrderCard component with status-specific buttons and hover animations
- QuickActions component with gradient icons and stagger animations
- StatsCard component with gradient icons
- ProductCard component with wishlist toggle and hover effects

**Features:**
- Route protection with automatic login redirect
- MSW mock data for orders, products, and user stats
- Data fetching with loading states
- Luxury aesthetic with animations and hover effects
- Responsive design (320px - 1920px breakpoints)
- Accessibility features (keyboard nav, ARIA labels, skip-to-content)

**Tests:**
- 6 unit tests (Header, Footer, OrderCard, QuickActions, StatsCard, ProductCard)
- 1 hook test (useProtectedRoute)
- 1 integration test (dashboard-access with 3 test cases)
- 8 E2E tests (dashboard.spec.ts)
- 7 visual regression tests (dashboard.visual.spec.ts)
- 7 responsive tests (responsive.visual.spec.ts)

**Total:** 30 tests

**Commands:**
```bash
# Run unit tests
npm test -- Header.test.tsx Footer.test.tsx OrderCard.test.tsx QuickActions.test.tsx StatsCard.test.tsx ProductCard.test.tsx useProtectedRoute.test.tsx

# Run integration tests
npm test -- dashboard-access.test.tsx

# Run E2E tests
npx playwright test dashboard.spec.ts

# Run visual regression tests
npx playwright test dashboard.visual.spec.ts responsive.visual.spec.ts
```

**Mock Endpoints:**
- `GET /api/v1/orders` - Returns mock orders
- `GET /api/v1/products/recommendations` - Returns mock products
- `GET /api/v1/users/stats` - Returns mock user stats

## Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests
npm run test:coverage # Coverage report
```

## Architecture

- **Next.js 15** with App Router
- **React Server Components** by default
- **Client Components** for interactivity
- **MSW** mocks all API calls
- **100% test coverage** enforced
