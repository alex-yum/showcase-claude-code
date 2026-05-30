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

### 🚧 Part C: Dashboard + Tests (Next)
- Dashboard layout with header/footer
- Dashboard page with mock data
- Order cards, product cards, stats cards
- Quick actions
- Full test coverage

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
