# Frontend Login & Dashboard Implementation Plan

## Context

This plan implements the **login page and dashboard (home page)** for the ShopHub e-commerce platform. The business requirement is to kickstart frontend development with a luxury B2C shopping experience featuring AI-powered recommendations and personalized content.

**Why this change:**
- Backend auth-service is implemented but not running
- Need UI to demonstrate authentication flow and dashboard UX
- Establish frontend architecture patterns for future features
- Validate luxury aesthetic design from HTML prototypes

**Current state:**
- No frontend code exists (pre-implementation)
- HTML prototypes available in `design/prototypes/` (login.html, dashboard.html)
- Auth-service API contract documented and explored
- Architecture defined in HLTD (Next.js 15, Tailwind, shadcn/ui)

**Intended outcome:**
- Working login page with form validation and error handling
- Protected dashboard showing mock orders, products, and stats
- 100% test coverage (unit, integration, E2E, visual)
- Luxury aesthetic with full animations (<2s page load)
- API calls to auth-service contract (mocked via MSW)
- Foundation for future features (checkout, product catalog, etc.)

---

## Architecture Overview

### **Approach: Server Components + Client Islands (Next.js 15)**

**Rationale:**
- Performance-first: <2s page load requirement
- Server Components for static content (layout, branding)
- Client Components for interactive parts (forms, animations)
- Future-proof: Easy migration to HTTP-only cookies when API Gateway ready

**Technology Stack:**
- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript 5.7
- **Styling:** Tailwind CSS 3.4 + shadcn/ui (customized for luxury aesthetic)
- **Forms:** React Hook Form 7.x + Zod 3.x validation
- **API Mocking:** MSW 2.x (Mock Service Worker)
- **Testing:** Vitest 2.x + React Testing Library 16.x + Playwright 1.48.x
- **Fonts:** next/font (Playfair Display + DM Sans)
- **Animations:** Framer Motion 11.x + Tailwind animations

---

## Directory Structure

```
frontend/                                  # NEW directory
├── app/
│   ├── (auth)/                           # Auth route group
│   │   ├── layout.tsx                    # Server: Luxury background, floating orbs
│   │   └── login/
│   │       ├── page.tsx                  # Server: Login page wrapper
│   │       └── LoginForm.tsx             # Client: Form with validation
│   ├── (dashboard)/                      # Dashboard route group
│   │   ├── layout.tsx                    # Server: Header, footer
│   │   └── dashboard/
│   │       ├── page.tsx                  # Server: Dashboard wrapper (passes mock data)
│   │       ├── OrderCard.tsx             # Client: Order display with hover
│   │       ├── QuickActions.tsx          # Client: Action buttons
│   │       ├── StatsCard.tsx             # Client: Stats display
│   │       └── ProductCard.tsx           # Client: Product recommendations
│   ├── layout.tsx                        # Root layout (fonts, providers)
│   └── globals.css                       # Tailwind imports
├── components/
│   ├── shared/                           # Cross-feature components
│   │   ├── Header.tsx                    # Site header
│   │   └── Footer.tsx                    # Site footer
│   └── ui/                               # shadcn/ui (customized for luxury)
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       └── ...
├── lib/
│   ├── api/
│   │   ├── config.ts                     # API base URL, endpoints (centralized)
│   │   ├── client.ts                     # ApiClient class with request methods
│   │   └── auth.ts                       # authApi.login/logout/validate
│   ├── auth/
│   │   ├── client.ts                     # authClient (localStorage abstraction)
│   │   └── context.tsx                   # AuthContext provider
│   ├── hooks/
│   │   ├── useAuth.ts                    # Auth state hook
│   │   └── useProtectedRoute.ts          # Route protection with redirect
│   ├── types/
│   │   └── auth.ts                       # TypeScript types (LoginRequest, etc.)
│   └── utils/
│       └── validators.ts                 # Zod schemas for forms
├── mocks/
│   ├── handlers.ts                       # MSW request handlers
│   ├── browser.ts                        # MSW browser setup
│   └── server.ts                         # MSW server setup (tests)
├── e2e/
│   ├── auth.spec.ts                      # E2E: Login flow
│   ├── dashboard.spec.ts                 # E2E: Dashboard access
│   ├── accessibility.spec.ts             # E2E: A11y checks
│   └── visual/
│       ├── login.visual.spec.ts          # Visual regression: Login
│       ├── dashboard.visual.spec.ts      # Visual regression: Dashboard
│       └── responsive.visual.spec.ts     # Visual regression: Breakpoints
├── __tests__/                            # Unit/integration tests
│   ├── components/
│   ├── lib/
│   └── hooks/
├── public/                               # Static assets
├── styles/
│   └── globals.css                       # Global styles
├── tailwind.config.ts                    # Tailwind custom config (luxury theme)
├── next.config.js
├── vitest.config.ts
├── playwright.config.ts
├── package.json
├── tsconfig.json
└── .env.local                            # NEXT_PUBLIC_API_BASE_URL
```

---

## Authentication Flow

### **Current Sprint (localStorage-based)**

```
1. User visits /dashboard
   ↓
2. useProtectedRoute() checks authClient.isAuthenticated()
   ├─ No token → Redirect to /login (save "/dashboard" as returnTo)
   └─ Has token → Continue

3. User submits login form (LoginForm.tsx)
   ↓
4. Client-side validation (Zod schema)
   ├─ Invalid → Show inline errors
   └─ Valid → Continue

5. authApi.login(credentials)
   → fetch('/api/v1/auth/login') → MSW intercepts → Mock response
   ↓
6. Success: { accessToken, tokenType, expiresIn, userId, email }
   ↓
7. authClient.login(response) → localStorage.setItem('token', accessToken)
   ↓
8. AuthContext updates (user, isAuthenticated)
   ↓
9. Redirect to returnTo URL or /dashboard
```

### **Auth API Contract (from auth-service)**

**Endpoints:**
- `POST /api/v1/auth/login` → { accessToken, tokenType, expiresIn, userId, email }
- `POST /api/v1/auth/logout` → { message }
- `GET /api/v1/auth/validate` → { valid, userId, email }

**Error Responses:**
- 400: Validation errors
- 401: Invalid credentials
- 423: Account locked (includes lockoutTimeRemaining)
- 500: Server error

### **Migration Path (Next Sprint)**

When API Gateway is implemented:
1. Add `middleware.ts` for cookie validation
2. Update `authApi` to use `credentials: 'include'`
3. Remove localStorage calls from `authClient`
4. AuthContext reads user from middleware context

**Architecture stays intact** - only `/lib/auth/` changes.

---

## Component Architecture

### **Key Components**

**Login Page:**

1. **`app/(auth)/layout.tsx`** (Server Component)
   - Luxury gradient background
   - Animated floating orbs (3 gradient orbs with blur)
   - Skip-to-content link (accessibility)

2. **`app/(auth)/login/page.tsx`** (Server Component)
   - Two-column responsive grid
   - Left: Branding (stats, tagline, hidden on mobile)
   - Right: LoginForm wrapper

3. **`app/(auth)/login/LoginForm.tsx`** (Client Component - 'use client')
   - React Hook Form + Zod validation
   - Fields: email, password, rememberMe checkbox
   - Password visibility toggle
   - Smart validation: blur first, then real-time after submit
   - Error display: inline (validation) + banner (401) + modal (423 locked)
   - Social auth buttons (static, "Coming Soon")
   - Loading state during submission

**Dashboard Page:**

1. **`app/(dashboard)/layout.tsx`** (Server Component)
   - Header: logo, search, cart icon, notifications, user menu
   - Footer: links, copyright
   - Glassmorphism header with sticky positioning

2. **`app/(dashboard)/dashboard/page.tsx`** (Server Component)
   - Fetches mock data (orders, products, stats)
   - Welcome section with user name
   - Main grid: left (orders, products), right (stats, notifications)
   - Passes data to Client Components as props

3. **`OrderCard.tsx`** (Client Component)
   - Order display: number, date, status badge, items, total
   - Hover lift animation
   - Action buttons: Track/Details/Buy Again

4. **`QuickActions.tsx`** (Client Component)
   - 4 cards: Shop Now, Track Orders, Wishlist, Sale Items
   - Gradient icons with rotation
   - Hover scale animation

5. **`StatsCard.tsx`** (Client Component)
   - Stats: orders this month, total spent, loyalty points
   - Gradient backgrounds

6. **`ProductCard.tsx`** (Client Component)
   - Product image, name, price, rating
   - Heart icon (wishlist toggle)
   - Add to cart button
   - Hover lift with shadow

---

## Styling & Theming

### **Tailwind Configuration**

**Custom theme (`tailwind.config.ts`):**

```typescript
{
  theme: {
    extend: {
      colors: {
        primary: '#1a1a2e',
        accent: { DEFAULT: '#d4af37', dark: '#b89530', light: '#f4e5b1' },
        surface: '#16213e',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
        'shimmer': 'shimmer 3s ease infinite',
        'float': 'float 20s infinite ease-in-out',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeInUp: { /* ... */ },
        shimmer: { /* ... */ },
        float: { /* ... */ },
      },
    },
  },
}
```

### **shadcn/ui Customization**

**Customize components for luxury aesthetic:**

- **Button**: Gold gradient with shimmer animation, ripple effect on click
- **Input**: Elegant focus with lift animation, gold border
- **Card**: Glassmorphism (backdrop-blur, transparency), hover lift
- **Badge**: Status-specific gradients (shipped, delivered, pending)

**All customizations in `/components/ui/` files** - edit once, use everywhere.

---

## API Integration

### **Centralized API Client**

**Configuration (`lib/api/config.ts`):**
```typescript
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  authService: '/api/v1/auth',
  timeout: 10000,
}
```

**Client Factory (`lib/api/client.ts`):**
```typescript
export class ApiClient {
  async request<T>(endpoint: string, options?: RequestInit): Promise<T>
  get<T>(endpoint: string): Promise<T>
  post<T>(endpoint: string, body?: any): Promise<T>
}

export const apiClient = new ApiClient()
```

**Auth API (`lib/api/auth.ts`):**
```typescript
export const authApi = {
  login(request: LoginRequest): Promise<LoginResponse>
  logout(): Promise<void>
  validate(): Promise<ValidateResponse>
}
```

**Benefits:**
- Single source of truth for API base URL
- Easy to add auth headers, logging, error handling
- Type-safe requests/responses
- Easy for AI agents to follow pattern

---

## Testing Strategy

### **Test Coverage: 100% (Required per CLAUDE.md)**

**1. Unit Tests (Vitest + React Testing Library)**

```
LoginForm.test.tsx
  ✓ Renders form fields
  ✓ Shows validation errors on blur
  ✓ Shows real-time validation after submit
  ✓ Displays 401 error banner
  ✓ Shows 423 lockout modal
  ✓ Toggles password visibility
  ✓ Submits with correct data
  ✓ Calls authApi.login

auth.test.ts
  ✓ authApi.login() calls correct endpoint
  ✓ authApi.logout() includes Bearer token
  ✓ Throws AuthError on failures

useAuth.test.ts
  ✓ Returns user when authenticated
  ✓ login() updates context
  ✓ logout() clears context

useProtectedRoute.test.ts
  ✓ Redirects to /login when not authenticated
  ✓ Saves returnTo URL
```

**2. Integration Tests (Vitest + MSW)**

```
login-flow.test.tsx
  ✓ Full login flow: form → API → localStorage → redirect
  ✓ Error flow: invalid credentials → error banner
  ✓ Account locked flow → modal with timer
  
dashboard-access.test.tsx
  ✓ Authenticated user sees dashboard
  ✓ Unauthenticated user redirects to login
  ✓ After login, redirects back to dashboard
```

**3. E2E Tests (Playwright)**

```
auth.spec.ts
  ✓ User can log in with valid credentials
  ✓ User sees error with invalid credentials
  ✓ User redirected to dashboard after login
  ✓ Protected routes require authentication

dashboard.spec.ts
  ✓ Dashboard displays orders/products/stats
  ✓ Quick actions are clickable
  ✓ Animations play correctly

accessibility.spec.ts
  ✓ Keyboard navigation works
  ✓ Screen reader support
  ✓ Skip-to-content link works
  ✓ Color contrast meets WCAG AA
```

**4. Visual Regression Tests (Playwright)**

```
visual/login.visual.spec.ts
  ✓ Login page (desktop)
  ✓ Login page (mobile 375px)
  ✓ Login page with error state
  ✓ Login page with loading state

visual/dashboard.visual.spec.ts
  ✓ Dashboard (desktop)
  ✓ Dashboard (mobile)
  ✓ Order card hover state
  ✓ Quick actions hover state

visual/responsive.visual.spec.ts
  ✓ Breakpoints: 320px, 768px, 1024px, 1440px
```

### **MSW Setup**

**Handlers (`mocks/handlers.ts`):**
```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = await request.json()
    if (body.email === 'test@example.com' && body.password === 'Test123!@#') {
      return HttpResponse.json({
        accessToken: 'mock-jwt-token',
        tokenType: 'Bearer',
        expiresIn: 86400000,
        userId: 1,
        email: body.email,
      })
    }
    return HttpResponse.json({
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid credentials',
    }, { status: 401 })
  }),
  // ... logout, validate, orders, products handlers
]
```

**Integration:**
- Browser: `mocks/browser.ts` → `worker.start()` in development
- Tests: `mocks/server.ts` → `beforeAll(() => server.listen())`

---

## Performance Optimization

**Target:** <2s page load, <500ms API response

**Techniques:**

1. **Code Splitting**
   - Lazy load heavy components (AI chatbot, admin panel)
   - Route-based splitting (automatic with Next.js App Router)

2. **Image Optimization**
   - Next.js `<Image>` component (automatic optimization)
   - Lazy loading with blur placeholder

3. **Font Optimization**
   - `next/font` with `display: 'swap'` (prevent FOIT)
   - Subset Latin characters only

4. **Animation Performance**
   - Use `transform` and `opacity` (GPU-accelerated)
   - Avoid animating: width, height, margin, padding
   - `will-change: transform` hint for hover effects
   - Respect `prefers-reduced-motion`

5. **Bundle Size**
   - Vendor chunk splitting
   - Tree-shaking unused code
   - Monitor with `@next/bundle-analyzer`

---

## Accessibility (WCAG 2.1 AA)

**Requirements:**

1. **Keyboard Navigation**
   - All interactive elements accessible via Tab
   - Custom focus styles (ring-4 ring-accent/50)
   - Skip-to-content link

2. **Screen Reader Support**
   - Semantic HTML (main, nav, form, heading hierarchy)
   - ARIA labels and descriptions
   - Error announcements with `role="alert"`

3. **Color Contrast**
   - Primary text: 13.2:1 contrast ratio ✅
   - Accent gold: 4.8:1 ✅
   - Error red: 4.5:1 ✅

4. **Motion Preferences**
   - `@media (prefers-reduced-motion: reduce)` disables animations
   - Hides decorative animations (orbs)

5. **Responsive Text**
   - Base 16px font size
   - Use `rem` units for scalability
   - Text resizable up to 200% without loss of functionality

---

## Implementation Steps

### **Phase 1: Project Setup**

1. **Initialize Next.js 15 project**
   ```bash
   npx create-next-app@latest frontend --typescript --tailwind --app
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install react-hook-form zod @hookform/resolvers
   npm install clsx tailwind-merge date-fns framer-motion
   npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
   npm install -D msw
   npm install -D @playwright/test
   npm install -D @next/bundle-analyzer
   ```

3. **Configure Tailwind**
   - Update `tailwind.config.ts` with luxury theme
   - Add custom animations and keyframes
   - Install `@tailwindcss/forms` plugin

4. **Setup fonts**
   - Configure Playfair Display and DM Sans with `next/font/google`
   - Add to root layout with CSS variables

5. **Initialize shadcn/ui**
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button input card badge
   ```
   - Customize components for luxury aesthetic

6. **Setup MSW**
   - Create `mocks/handlers.ts` with auth endpoints
   - Create `mocks/browser.ts` and `mocks/server.ts`
   - Add MSW initialization to `app/layout.tsx` (dev only)

7. **Configure Vitest**
   - Create `vitest.config.ts`
   - Setup MSW in test environment
   - Add test scripts to `package.json`

8. **Configure Playwright**
   - Create `playwright.config.ts`
   - Add visual regression config
   - Add test scripts

### **Phase 2: Authentication Implementation**

1. **Create types** (`lib/types/auth.ts`)
   - LoginRequest, LoginResponse, ValidateResponse, User, AuthError

2. **Create API client** (`lib/api/`)
   - `config.ts`: API_CONFIG with base URL
   - `client.ts`: ApiClient class
   - `auth.ts`: authApi.login/logout/validate

3. **Create auth utilities** (`lib/auth/`)
   - `client.ts`: authClient (localStorage abstraction)
   - `context.tsx`: AuthContext provider

4. **Create hooks** (`lib/hooks/`)
   - `useAuth.ts`: Access auth context
   - `useProtectedRoute.ts`: Route protection with redirect

5. **Create auth layout** (`app/(auth)/layout.tsx`)
   - Luxury gradient background
   - Floating animated orbs
   - Server Component

6. **Create login page** (`app/(auth)/login/`)
   - `page.tsx`: Two-column layout (Server Component)
   - `LoginForm.tsx`: Form with validation (Client Component)

7. **Write tests**
   - Unit: `LoginForm.test.tsx`, `auth.test.ts`, `useAuth.test.ts`
   - Integration: `login-flow.test.tsx`
   - E2E: `auth.spec.ts`
   - Visual: `visual/login.visual.spec.ts`

### **Phase 3: Dashboard Implementation**

1. **Create shared components** (`components/shared/`)
   - `Header.tsx`: Site header with search, cart, notifications
   - `Footer.tsx`: Site footer

2. **Create dashboard layout** (`app/(dashboard)/layout.tsx`)
   - Wrap with Header and Footer
   - Server Component

3. **Create mock data**
   - Add order/product handlers to `mocks/handlers.ts`
   - Mock user stats

4. **Create dashboard page** (`app/(dashboard)/dashboard/`)
   - `page.tsx`: Fetch mock data, pass to components (Server Component)
   - `OrderCard.tsx`: Order display (Client Component)
   - `QuickActions.tsx`: Action buttons (Client Component)
   - `StatsCard.tsx`: Stats display (Client Component)
   - `ProductCard.tsx`: Product recommendations (Client Component)

5. **Add route protection**
   - Use `useProtectedRoute()` hook in dashboard page
   - Test redirect flow

6. **Write tests**
   - Unit: Component tests for OrderCard, QuickActions, etc.
   - Integration: `dashboard-access.test.tsx`
   - E2E: `dashboard.spec.ts`, `accessibility.spec.ts`
   - Visual: `visual/dashboard.visual.spec.ts`, `visual/responsive.visual.spec.ts`

### **Phase 4: Polish & Optimization**

1. **Add animations**
   - Staggered entrance animations
   - Hover effects with lift and shadow
   - Shimmer on gold gradients
   - Loading states

2. **Optimize performance**
   - Add code splitting for heavy components
   - Optimize images
   - Add bundle analyzer
   - Test page load times

3. **Accessibility audit**
   - Run Lighthouse accessibility checks
   - Test keyboard navigation
   - Test screen reader support
   - Verify color contrast

4. **Visual polish**
   - Review all breakpoints (320px, 768px, 1024px, 1440px)
   - Test animations on different devices
   - Verify luxury aesthetic consistency
   - Update visual regression baselines

### **Phase 5: Documentation & Handoff**

1. **Update README.md**
   - Setup instructions
   - Development commands
   - Testing instructions
   - Mock credentials for testing

2. **Create component documentation**
   - Document props and usage for key components
   - Add JSDoc comments

3. **Final testing pass**
   - Run all tests: `npm run test:all`
   - Verify 100% coverage
   - Run E2E suite
   - Update visual baselines

---

## Verification

**Before marking as complete, verify:**

1. **Functionality**
   - [ ] Login with valid credentials works (test@example.com / Test123!@#)
   - [ ] Login with invalid credentials shows error
   - [ ] Password visibility toggle works
   - [ ] Remember me checkbox persists
   - [ ] Logout clears token and redirects
   - [ ] Protected route redirects to login
   - [ ] After login, redirects to saved URL
   - [ ] Dashboard displays mock orders
   - [ ] Dashboard displays mock products
   - [ ] Dashboard displays stats
   - [ ] All hover animations work
   - [ ] All buttons are clickable

2. **Testing**
   - [ ] `npm run test` passes (100% coverage)
   - [ ] `npm run test:e2e` passes
   - [ ] `npm run test:visual` passes (or baselines updated)
   - [ ] No console errors or warnings

3. **Performance**
   - [ ] Login page loads in <2s
   - [ ] Dashboard loads in <2s
   - [ ] No layout shift (CLS < 0.1)
   - [ ] Animations run at 60fps

4. **Accessibility**
   - [ ] Keyboard navigation works (Tab through all elements)
   - [ ] Skip-to-content link works
   - [ ] Screen reader announces errors
   - [ ] Focus indicators visible
   - [ ] Color contrast passes WCAG AA

5. **Visual Quality**
   - [ ] Luxury aesthetic matches prototypes
   - [ ] Animations are smooth
   - [ ] Spacing and alignment correct
   - [ ] Responsive at all breakpoints
   - [ ] Glassmorphism effects render correctly

**Commands to run:**
```bash
# Development
npm run dev                    # Start dev server

# Testing
npm run test                   # Unit + integration tests
npm run test:coverage          # Coverage report
npm run test:e2e               # E2E tests
npm run test:visual            # Visual regression
npm run test:all               # All tests

# Build
npm run build                  # Production build
npm run start                  # Start production server

# Analysis
npm run analyze                # Bundle size analysis
```

---

## Future Work (Transfer to Todo.md after completion)

**Next Sprint (API Gateway ready):**
- [ ] Add middleware.ts for cookie validation
- [ ] Update authApi to use `credentials: 'include'`
- [ ] Remove localStorage calls from lib/auth/client.ts
- [ ] Add AuthContext provider that reads from middleware
- [ ] Test protected routes enforce server-side validation

**Future Enhancements:**
- [ ] Switch from localStorage to HTTP-only cookies
- [ ] Implement token refresh logic before expiration
- [ ] Add CSRF protection for cookie-based auth
- [ ] Implement secure flag for cookies in production
- [ ] Add device/session management (track active sessions)
- [ ] Performance monitoring post-launch
- [ ] Implement progressive enhancement fallback if <2s missed
- [ ] Add Storybook for component development
- [ ] Consider Chromatic for visual testing (if budget allows)

---

## Critical Files

**New files to create:**

Frontend structure:
- `frontend/app/layout.tsx` - Root layout with fonts, providers
- `frontend/app/(auth)/layout.tsx` - Auth layout with luxury background
- `frontend/app/(auth)/login/page.tsx` - Login page wrapper
- `frontend/app/(auth)/login/LoginForm.tsx` - Login form component
- `frontend/app/(dashboard)/layout.tsx` - Dashboard layout with header/footer
- `frontend/app/(dashboard)/dashboard/page.tsx` - Dashboard page
- `frontend/app/(dashboard)/dashboard/OrderCard.tsx` - Order card component
- `frontend/app/(dashboard)/dashboard/QuickActions.tsx` - Quick actions component
- `frontend/app/(dashboard)/dashboard/StatsCard.tsx` - Stats card component
- `frontend/app/(dashboard)/dashboard/ProductCard.tsx` - Product card component

API layer:
- `frontend/lib/api/config.ts` - API configuration
- `frontend/lib/api/client.ts` - ApiClient class
- `frontend/lib/api/auth.ts` - Auth API methods

Auth utilities:
- `frontend/lib/auth/client.ts` - Auth client (localStorage abstraction)
- `frontend/lib/auth/context.tsx` - AuthContext provider

Hooks:
- `frontend/lib/hooks/useAuth.ts` - Auth state hook
- `frontend/lib/hooks/useProtectedRoute.ts` - Route protection hook

Types:
- `frontend/lib/types/auth.ts` - Auth TypeScript types

Mocks:
- `frontend/mocks/handlers.ts` - MSW request handlers
- `frontend/mocks/browser.ts` - MSW browser setup
- `frontend/mocks/server.ts` - MSW server setup

Shared components:
- `frontend/components/shared/Header.tsx` - Site header
- `frontend/components/shared/Footer.tsx` - Site footer

shadcn/ui components:
- `frontend/components/ui/button.tsx` - Customized button
- `frontend/components/ui/input.tsx` - Customized input
- `frontend/components/ui/card.tsx` - Customized card
- `frontend/components/ui/badge.tsx` - Customized badge

Config:
- `frontend/tailwind.config.ts` - Tailwind luxury theme
- `frontend/next.config.js` - Next.js configuration
- `frontend/vitest.config.ts` - Vitest configuration
- `frontend/playwright.config.ts` - Playwright configuration
- `frontend/.env.local` - Environment variables

**Existing files to reference:**
- `backend/services/auth-service/src/main/java/com/shophub/auth/controller/AuthController.java` - API contract
- `design/prototypes/login.html` - Login UI reference
- `design/prototypes/dashboard.html` - Dashboard UI reference
- `requirement/Business Requirement.md` - Business requirements
- `design/High Level Technical Design.md` - Architecture decisions
- `CLAUDE.md` - Project guidelines and constraints

---

## Notes

**Key architectural decisions:**
1. **Server Components by default** - Client only when needed for interactivity
2. **Feature-based organization** - Components stay with routes until proven reuse
3. **Centralized API client** - Single source of truth for API configuration
4. **localStorage now, cookies later** - Clear migration path documented
5. **100% luxury aesthetic** - All animations (Option A) with performance optimization
6. **MSW for all mocking** - Single mocking strategy across all test types
7. **Vitest over Jest** - Better for Next.js 15 + TypeScript
8. **Playwright visual regression** - Catch layout/CSS bugs automatically

**Test credentials (mocked in MSW):**
- Email: `test@example.com`
- Password: `Test123!@#`

**Environment variables:**
```bash
NEXT_PUBLIC_API_BASE_URL=     # Empty for MSW in development
```

**Remember:** Auth-service is implemented but not running. All API calls are mocked via MSW. Real integration happens next sprint when API Gateway is ready.
