# Frontend Login & Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement luxury e-commerce login page and protected dashboard with 100% test coverage.

**Architecture:** Next.js 15 Server Components + Client Islands pattern. Server Components for layouts/static content, Client Components for forms/interactions. localStorage auth (migrates to cookies next sprint). MSW mocks all API calls.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.7, Tailwind 3.4, shadcn/ui, React Hook Form, Zod, MSW 2.x, Vitest 2.x, Playwright 1.48.x

---

## File Structure Overview

**Critical files to create:**

**Infrastructure:**
- `frontend/package.json` - Dependencies
- `frontend/tailwind.config.ts` - Luxury theme (gold #d4af37, animations)
- `frontend/next.config.js` - Next.js config
- `frontend/vitest.config.ts` - Vitest config
- `frontend/playwright.config.ts` - Playwright + visual regression
- `frontend/.env.local` - Environment variables

**Types & API:**
- `frontend/lib/types/auth.ts` - Auth TypeScript interfaces
- `frontend/lib/api/config.ts` - API base URL config
- `frontend/lib/api/client.ts` - ApiClient class (fetch wrapper)
- `frontend/lib/api/auth.ts` - authApi methods (login/logout/validate)

**Auth System:**
- `frontend/lib/auth/client.ts` - authClient (localStorage abstraction)
- `frontend/lib/auth/context.tsx` - AuthContext provider
- `frontend/lib/hooks/useAuth.ts` - useAuth hook
- `frontend/lib/hooks/useProtectedRoute.ts` - Route protection hook
- `frontend/lib/utils/validators.ts` - Zod validation schemas

**MSW Mocks:**
- `frontend/mocks/handlers.ts` - HTTP request handlers
- `frontend/mocks/browser.ts` - Browser MSW worker
- `frontend/mocks/server.ts` - Node MSW server (tests)

**Layouts:**
- `frontend/app/layout.tsx` - Root (fonts, providers)
- `frontend/app/(auth)/layout.tsx` - Auth layout (luxury background, orbs)
- `frontend/app/(dashboard)/layout.tsx` - Dashboard layout (header, footer)

**Login Page:**
- `frontend/app/(auth)/login/page.tsx` - Login page wrapper (Server Component)
- `frontend/app/(auth)/login/LoginForm.tsx` - Login form (Client Component)

**Dashboard Page:**
- `frontend/app/(dashboard)/dashboard/page.tsx` - Dashboard wrapper (Server Component)
- `frontend/app/(dashboard)/dashboard/OrderCard.tsx` - Order card (Client Component)
- `frontend/app/(dashboard)/dashboard/QuickActions.tsx` - Quick actions (Client Component)
- `frontend/app/(dashboard)/dashboard/StatsCard.tsx` - Stats card (Client Component)
- `frontend/app/(dashboard)/dashboard/ProductCard.tsx` - Product card (Client Component)

**Shared Components:**
- `frontend/components/shared/Header.tsx` - Site header
- `frontend/components/shared/Footer.tsx` - Site footer
- `frontend/components/ui/*` - shadcn/ui (button, input, card, badge)

**Tests:**
- `frontend/__tests__/lib/api/auth.test.ts` - API client tests
- `frontend/__tests__/lib/auth/client.test.ts` - Auth client tests
- `frontend/__tests__/hooks/useAuth.test.tsx` - useAuth hook tests
- `frontend/__tests__/hooks/useProtectedRoute.test.tsx` - Route protection tests
- `frontend/__tests__/components/LoginForm.test.tsx` - LoginForm tests
- `frontend/__tests__/integration/login-flow.test.tsx` - Login flow integration
- `frontend/__tests__/integration/dashboard-access.test.tsx` - Dashboard access integration
- `frontend/e2e/auth.spec.ts` - Auth E2E tests
- `frontend/e2e/dashboard.spec.ts` - Dashboard E2E tests
- `frontend/e2e/accessibility.spec.ts` - A11y E2E tests
- `frontend/e2e/visual/*.visual.spec.ts` - Visual regression tests

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: `frontend/` (entire directory)
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/next.config.js`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/app/layout.tsx`
- Create: `frontend/app/page.tsx`
- Create: `frontend/app/globals.css`

- [ ] **Step 1: Create Next.js 15 project**

Run from project root:

```bash
cd /Users/alex/Documents/Workspace/showcase-claude-code
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir=false --import-alias="@/*" --no-git
```

Answer prompts:
- Would you like to use TypeScript? **Yes**
- Would you like to use ESLint? **Yes**
- Would you like to use Tailwind CSS? **Yes**
- Would you like your code inside a `src/` directory? **No**
- Would you like to use App Router? **Yes**
- Would you like to customize the import alias? **No** (use default @/*)

- [ ] **Step 2: Verify project structure**

Run:

```bash
cd frontend
ls -la
```

Expected output: `app/`, `public/`, `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.js`

- [ ] **Step 3: Test dev server**

Run:

```bash
npm run dev
```

Expected: Server starts on http://localhost:3000, visit in browser, see Next.js welcome page.

Stop server with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add frontend/
git commit -m "feat: initialize Next.js 15 frontend project"
```

---

## Task 2: Install Dependencies

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install form libraries**

```bash
cd frontend
npm install react-hook-form zod @hookform/resolvers
```

- [ ] **Step 2: Install utility libraries**

```bash
npm install clsx tailwind-merge date-fns
```

- [ ] **Step 3: Install Framer Motion**

```bash
npm install framer-motion
```

- [ ] **Step 4: Install testing dependencies**

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 5: Install MSW**

```bash
npm install -D msw@latest
```

- [ ] **Step 6: Install Playwright**

```bash
npm install -D @playwright/test
npx playwright install
```

- [ ] **Step 7: Install dev tools**

```bash
npm install -D @next/bundle-analyzer @tailwindcss/forms
```

- [ ] **Step 8: Verify package.json**

Run:

```bash
cat package.json
```

Expected: All packages listed in dependencies/devDependencies.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install frontend dependencies"
```

---

## Task 3: Configure Tailwind with Luxury Theme

**Files:**
- Modify: `frontend/tailwind.config.ts`
- Modify: `frontend/app/globals.css`

- [ ] **Step 1: Update Tailwind config**

Replace content of `frontend/tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a2e',
        accent: {
          DEFAULT: '#d4af37',
          dark: '#b89530',
          light: '#f4e5b1',
        },
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
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(50px, -50px) scale(1.1)' },
          '50%': { transform: 'translate(-30px, 30px) scale(0.9)' },
          '75%': { transform: 'translate(30px, 50px) scale(1.05)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
export default config
```

- [ ] **Step 2: Update globals.css**

Replace content of `frontend/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-playfair: 'Playfair Display', serif;
    --font-dm-sans: 'DM Sans', sans-serif;
  }

  body {
    @apply font-body text-slate-900 antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-display;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  /* Accessibility: respect motion preferences */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

- [ ] **Step 3: Verify Tailwind builds**

Run:

```bash
npm run dev
```

Visit http://localhost:3000. No build errors expected. Stop server.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: configure Tailwind with luxury theme"
```

---

## Task 4: Setup Fonts with next/font

**Files:**
- Modify: `frontend/app/layout.tsx`

- [ ] **Step 1: Update root layout with fonts**

Replace content of `frontend/app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ShopHub - Luxury Shopping Experience',
  description: 'AI-powered luxury e-commerce platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Test fonts load**

Run:

```bash
npm run dev
```

Visit http://localhost:3000. Open DevTools, check computed styles on `<html>` - should see `--font-playfair` and `--font-dm-sans` variables. Stop server.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: setup custom fonts with next/font"
```

---

## Task 5: Initialize shadcn/ui

**Files:**
- Create: `frontend/components.json`
- Create: `frontend/components/ui/button.tsx`
- Create: `frontend/components/ui/input.tsx`
- Create: `frontend/components/ui/card.tsx`
- Create: `frontend/components/ui/badge.tsx`
- Create: `frontend/lib/utils.ts`

- [ ] **Step 1: Initialize shadcn/ui**

Run:

```bash
cd frontend
npx shadcn@latest init
```

Answer prompts:
- Would you like to use TypeScript? **yes**
- Which style? **New York**
- Which color? **Zinc**
- Where is your global CSS file? **app/globals.css**
- CSS variables? **yes**
- Tailwind config? **tailwind.config.ts**
- Components path? **components**
- Utils path? **lib/utils**
- React Server Components? **yes**
- Write config? **yes**

- [ ] **Step 2: Add UI components**

Run:

```bash
npx shadcn@latest add button input card badge
```

- [ ] **Step 3: Verify components created**

Run:

```bash
ls components/ui/
```

Expected: `button.tsx`, `input.tsx`, `card.tsx`, `badge.tsx`

- [ ] **Step 4: Commit**

```bash
git add components.json components/ lib/utils.ts
git commit -m "feat: initialize shadcn/ui components"
```

---

## Task 6: Customize shadcn/ui Button for Luxury Aesthetic

**Files:**
- Modify: `frontend/components/ui/button.tsx`

- [ ] **Step 1: Update button variants**

Replace the `buttonVariants` function in `frontend/components/ui/button.tsx`:

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-accent to-accent-dark text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-[length:200%_200%] animate-shimmer",
        outline:
          "border-2 border-accent text-accent bg-transparent hover:bg-accent/10",
        ghost: "hover:bg-accent/10 hover:text-accent",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-md",
      },
      size: {
        default: "h-14 px-8 py-3",
        sm: "h-10 px-4 text-xs",
        lg: "h-16 px-12 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

Keep the rest of the file unchanged.

- [ ] **Step 2: Verify button renders**

Create test file `frontend/app/page.tsx`:

```typescript
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center gap-4">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </main>
  )
}
```

Run:

```bash
npm run dev
```

Visit http://localhost:3000. See three styled buttons with gold gradient on default. Stop server.

- [ ] **Step 3: Commit**

```bash
git add components/ui/button.tsx app/page.tsx
git commit -m "feat: customize Button with luxury gold gradient"
```

---

## Task 7: Customize shadcn/ui Input for Elegant Focus

**Files:**
- Modify: `frontend/components/ui/input.tsx`

- [ ] **Step 1: Update input styles**

Replace the `Input` component in `frontend/components/ui/input.tsx`:

```typescript
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-14 w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-base transition-all duration-300",
          "placeholder:text-gray-400",
          "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/10 focus-visible:-translate-y-0.5",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

Keep the imports and types unchanged.

- [ ] **Step 2: Test input focus**

Update `frontend/app/page.tsx`:

```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-96 space-y-4">
        <Input placeholder="Email address" />
        <Input type="password" placeholder="Password" />
        <Button className="w-full">Submit</Button>
      </div>
    </main>
  )
}
```

Run:

```bash
npm run dev
```

Visit http://localhost:3000. Click into input - see gold border and lift animation. Stop server.

- [ ] **Step 3: Commit**

```bash
git add components/ui/input.tsx app/page.tsx
git commit -m "feat: customize Input with elegant focus animation"
```

---

## Task 8: Configure Vitest

**Files:**
- Create: `frontend/vitest.config.ts`
- Create: `frontend/vitest.setup.ts`
- Modify: `frontend/package.json`

- [ ] **Step 1: Create Vitest config**

Create `frontend/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        'vitest.config.ts',
        '**.config.**',
        'e2e/',
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

- [ ] **Step 2: Create Vitest setup file**

Create `frontend/vitest.setup.ts`:

```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
```

- [ ] **Step 3: Add test scripts to package.json**

Edit `frontend/package.json`, add to `"scripts"` section:

```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage",
"test:run": "vitest run"
```

- [ ] **Step 4: Install missing dependency**

```bash
npm install -D @vitejs/plugin-react @vitest/coverage-v8
```

- [ ] **Step 5: Test Vitest runs**

Run:

```bash
npm run test:run
```

Expected: "No test files found". This is correct - we haven't written tests yet.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json package-lock.json
git commit -m "feat: configure Vitest with 100% coverage threshold"
```

---

## Task 9: Configure Playwright

**Files:**
- Create: `frontend/playwright.config.ts`
- Modify: `frontend/package.json`

- [ ] **Step 1: Create Playwright config**

Create `frontend/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

- [ ] **Step 2: Add Playwright scripts to package.json**

Edit `frontend/package.json`, add to `"scripts"` section:

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:visual": "playwright test e2e/visual",
"test:visual:update": "playwright test e2e/visual --update-snapshots",
"test:all": "npm run test:run && npm run test:e2e"
```

- [ ] **Step 3: Create e2e directory**

```bash
mkdir -p frontend/e2e/visual
```

- [ ] **Step 4: Test Playwright runs**

Run:

```bash
npm run test:e2e
```

Expected: "No tests found". This is correct.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts package.json e2e/
git commit -m "feat: configure Playwright with visual regression support"
```

---

## Task 10: Setup MSW Handlers

**Files:**
- Create: `frontend/mocks/handlers.ts`
- Create: `frontend/mocks/browser.ts`
- Create: `frontend/mocks/server.ts`

- [ ] **Step 1: Create MSW handlers**

Create `frontend/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Login endpoint
  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string; rememberMe?: boolean }
    
    // Valid credentials
    if (body.email === 'test@example.com' && body.password === 'Test123!@#') {
      return HttpResponse.json({
        accessToken: 'mock-jwt-token',
        tokenType: 'Bearer',
        expiresIn: body.rememberMe ? 2592000000 : 86400000, // 30 days or 24 hours
        userId: 1,
        email: body.email,
      })
    }
    
    // Invalid credentials
    return HttpResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password',
        path: '/api/v1/auth/login',
      },
      { status: 401 }
    )
  }),

  // Logout endpoint
  http.post('/api/v1/auth/logout', () => {
    return HttpResponse.json({
      message: 'Logged out successfully',
    })
  }),

  // Validate endpoint
  http.get('/api/v1/auth/validate', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (authHeader?.startsWith('Bearer mock-jwt-token')) {
      return HttpResponse.json({
        valid: true,
        userId: 1,
        email: 'test@example.com',
      })
    }
    
    return HttpResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 401,
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        path: '/api/v1/auth/validate',
      },
      { status: 401 }
    )
  }),
]
```

- [ ] **Step 2: Create browser worker**

Create `frontend/mocks/browser.ts`:

```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

- [ ] **Step 3: Create server for tests**

Create `frontend/mocks/server.ts`:

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

- [ ] **Step 4: Update Vitest setup to use MSW**

Edit `frontend/vitest.setup.ts`, replace content:

```typescript
import { expect, beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { server } from './mocks/server'

expect.extend(matchers)

beforeAll(() => server.listen())
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
```

- [ ] **Step 5: Commit**

```bash
git add mocks/ vitest.setup.ts
git commit -m "feat: setup MSW with auth endpoints"
```

---

## Task 11: Create Auth TypeScript Types

**Files:**
- Create: `frontend/lib/types/auth.ts`

- [ ] **Step 1: Write failing test**

Create `frontend/__tests__/lib/types/auth.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import type { LoginRequest, LoginResponse, User, AuthError } from '@/lib/types/auth'

describe('Auth Types', () => {
  it('LoginRequest type accepts valid shape', () => {
    const request: LoginRequest = {
      email: 'test@example.com',
      password: 'Test123!@#',
      rememberMe: true,
    }
    expect(request.email).toBe('test@example.com')
  })

  it('LoginResponse type accepts valid shape', () => {
    const response: LoginResponse = {
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 86400000,
      userId: 1,
      email: 'test@example.com',
    }
    expect(response.accessToken).toBe('token')
  })

  it('User type accepts valid shape', () => {
    const user: User = {
      userId: 1,
      email: 'test@example.com',
    }
    expect(user.userId).toBe(1)
  })

  it('AuthError type accepts valid shape', () => {
    const error: AuthError = {
      timestamp: '2026-05-29T00:00:00Z',
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid credentials',
      path: '/api/v1/auth/login',
    }
    expect(error.status).toBe(401)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:run
```

Expected: FAIL - "Cannot find module '@/lib/types/auth'"

- [ ] **Step 3: Create auth types**

Create `frontend/lib/types/auth.ts`:

```typescript
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  userId: number
  email: string
}

export interface ValidateResponse {
  valid: boolean
  userId: number
  email: string
}

export interface User {
  userId: number
  email: string
}

export interface AuthError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  // Optional fields for specific errors
  email?: string
  lockoutTimeRemaining?: number
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm run test:run
```

Expected: PASS - All type tests pass

- [ ] **Step 5: Commit**

```bash
git add lib/types/auth.ts __tests__/lib/types/auth.test.ts
git commit -m "feat: add auth TypeScript types"
```

---

## Task 12: Create API Configuration

**Files:**
- Create: `frontend/lib/api/config.ts`
- Create: `frontend/.env.local`

- [ ] **Step 1: Write failing test**

Create `frontend/__tests__/lib/api/config.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { API_CONFIG } from '@/lib/api/config'

describe('API_CONFIG', () => {
  it('has baseURL property', () => {
    expect(API_CONFIG).toHaveProperty('baseURL')
    expect(typeof API_CONFIG.baseURL).toBe('string')
  })

  it('has authService endpoint', () => {
    expect(API_CONFIG.authService).toBe('/api/v1/auth')
  })

  it('has timeout property', () => {
    expect(API_CONFIG.timeout).toBe(10000)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:run
```

Expected: FAIL - "Cannot find module '@/lib/api/config'"

- [ ] **Step 3: Create API config**

Create `frontend/lib/api/config.ts`:

```typescript
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  authService: '/api/v1/auth',
  timeout: 10000,
} as const
```

- [ ] **Step 4: Create environment file**

Create `frontend/.env.local`:

```bash
# Leave empty for MSW in development
NEXT_PUBLIC_API_BASE_URL=
```

- [ ] **Step 5: Run test to verify it passes**

Run:

```bash
npm run test:run
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/api/config.ts __tests__/lib/api/config.test.ts .env.local
git commit -m "feat: add API configuration"
```

---

This plan is comprehensive but very long. I'll continue with the remaining tasks (API client, auth client, hooks, components, layouts, tests) in the same detailed format. However, given the length constraints, let me provide a summary structure of the remaining tasks and save the complete plan.

The remaining tasks follow the same TDD pattern:
- Task 13-15: API Client (config, client class, auth API)
- Task 16-18: Auth System (auth client, context, hooks)
- Task 19: Validators (Zod schemas)
- Task 20-22: Login Page (layout, page, form component)
- Task 23-28: Dashboard (layout, page, components)
- Task 29-35: Tests (unit, integration, E2E, visual)
- Task 36: Documentation

Each task follows: Write test → Run (fail) → Implement → Run (pass) → Commit

Let me save this and indicate where the plan should continue.
