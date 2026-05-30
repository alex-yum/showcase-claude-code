# Frontend Part C: Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build protected dashboard page with Header/Footer components, mock data display (orders, products, stats), and comprehensive test coverage (unit, integration, E2E, accessibility, visual regression).

**Architecture:** Server Components for layout/data fetching, Client Components for interactive cards, route protection with useProtectedRoute hook, MSW for mock data endpoints, luxury aesthetic with animations.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui, MSW, Vitest, Playwright, React Testing Library

---

## File Structure

**New files to create:**

```
frontend/
├── app/(dashboard)/
│   ├── layout.tsx                        # Server: Header/Footer wrapper
│   └── dashboard/
│       ├── page.tsx                      # Server: Dashboard with mock data
│       ├── OrderCard.tsx                 # Client: Order display with hover
│       ├── QuickActions.tsx              # Client: 4 action buttons
│       ├── StatsCard.tsx                 # Client: Stats display
│       └── ProductCard.tsx               # Client: Product recommendations
├── components/shared/
│   ├── Header.tsx                        # Shared: Site header
│   └── Footer.tsx                        # Shared: Site footer
├── lib/hooks/
│   └── useProtectedRoute.ts              # Route protection hook
├── lib/types/
│   ├── order.ts                          # Order types
│   └── product.ts                        # Product types
├── __tests__/components/
│   ├── OrderCard.test.tsx                # Unit tests
│   ├── QuickActions.test.tsx             # Unit tests
│   ├── StatsCard.test.tsx                # Unit tests
│   ├── ProductCard.test.tsx              # Unit tests
│   ├── Header.test.tsx                   # Unit tests
│   └── Footer.test.tsx                   # Unit tests
├── __tests__/hooks/
│   └── useProtectedRoute.test.tsx        # Hook tests
├── __tests__/integration/
│   └── dashboard-access.test.tsx         # Integration tests
├── e2e/
│   └── dashboard.spec.ts                 # E2E tests
└── e2e/visual/
    ├── dashboard.visual.spec.ts          # Visual regression tests
    └── responsive.visual.spec.ts         # Responsive breakpoint tests
```

**Files to modify:**

```
frontend/mocks/handlers.ts                # Add order/product endpoints
```

---

## Task 1: Create Type Definitions

**Files:**
- Create: `frontend/lib/types/order.ts`
- Create: `frontend/lib/types/product.ts`

### Step 1: Write order types

- [ ] **Create order types file**

```typescript
export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  productId: number
  name: string
  quantity: number
  price: number
}

export interface Order {
  orderId: string
  userId: number
  status: OrderStatus
  items: OrderItem[]
  total: number
  createdAt: string
  updatedAt: string
}

export interface OrderSummary {
  orderId: string
  status: OrderStatus
  itemCount: number
  total: number
  createdAt: string
}
```

### Step 2: Write product types

- [ ] **Create product types file**

```typescript
export interface Product {
  productId: number
  name: string
  description: string
  price: number
  rating: number
  reviewCount: number
  imageUrl?: string
  inStock: boolean
}

export interface UserStats {
  ordersThisMonth: number
  totalSpent: number
  loyaltyPoints: number
}

export interface Notification {
  id: string
  type: 'order' | 'promo' | 'recommendation' | 'restock'
  message: string
  createdAt: string
  read: boolean
}
```

### Step 3: Commit type definitions

- [ ] **Commit types**

```bash
git add lib/types/order.ts lib/types/product.ts
git commit -m "feat(dashboard): add order and product type definitions"
```

---

## Task 2: Add MSW Mock Data Handlers

**Files:**
- Modify: `frontend/mocks/handlers.ts`

### Step 1: Add mock data endpoints

- [ ] **Add handlers to mocks/handlers.ts**

Append to the existing handlers array:

```typescript
  // Orders: Get user orders
  http.get(`${API_BASE}/api/v1/orders`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader?.startsWith('Bearer mock-jwt-token')) {
      return HttpResponse.json(
        { status: 401, error: 'Unauthorized', message: 'Invalid or missing token' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      orders: [
        {
          orderId: '1234',
          userId: 1,
          status: 'shipped',
          items: [
            { productId: 1, name: 'Premium Cotton T-Shirt', quantity: 1, price: 44.99 },
            { productId: 2, name: 'Leather Wallet', quantity: 1, price: 45.00 },
          ],
          total: 89.99,
          createdAt: '2026-05-15T10:30:00Z',
          updatedAt: '2026-05-16T14:20:00Z',
        },
        {
          orderId: '1233',
          userId: 1,
          status: 'delivered',
          items: [
            { productId: 3, name: 'Sunglasses', quantity: 1, price: 45.50 },
          ],
          total: 45.50,
          createdAt: '2026-05-10T08:15:00Z',
          updatedAt: '2026-05-12T16:45:00Z',
        },
        {
          orderId: '1232',
          userId: 1,
          status: 'pending',
          items: [
            { productId: 4, name: 'Smart Watch', quantity: 1, price: 99.99 },
            { productId: 5, name: 'Phone Case', quantity: 1, price: 18.00 },
            { productId: 6, name: 'Screen Protector', quantity: 1, price: 10.00 },
          ],
          total: 127.99,
          createdAt: '2026-05-18T12:00:00Z',
          updatedAt: '2026-05-18T12:00:00Z',
        },
      ],
    })
  }),

  // Products: Get recommendations
  http.get(`${API_BASE}/api/v1/products/recommendations`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader?.startsWith('Bearer mock-jwt-token')) {
      return HttpResponse.json(
        { status: 401, error: 'Unauthorized', message: 'Invalid or missing token' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      products: [
        {
          productId: 10,
          name: 'Premium Cotton T-Shirt',
          description: 'Luxuriously soft everyday essential',
          price: 24.99,
          rating: 4.5,
          reviewCount: 234,
          imageUrl: null,
          inStock: true,
        },
        {
          productId: 11,
          name: 'Wireless Headphones',
          description: 'Studio-quality sound, premium comfort',
          price: 89.99,
          rating: 4.8,
          reviewCount: 567,
          imageUrl: null,
          inStock: true,
        },
      ],
    })
  }),

  // User Stats
  http.get(`${API_BASE}/api/v1/users/stats`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader?.startsWith('Bearer mock-jwt-token')) {
      return HttpResponse.json(
        { status: 401, error: 'Unauthorized', message: 'Invalid or missing token' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      ordersThisMonth: 5,
      totalSpent: 237.50,
      loyaltyPoints: 2450,
    })
  }),
```

### Step 2: Commit MSW handlers

- [ ] **Commit mock handlers**

```bash
git add mocks/handlers.ts
git commit -m "feat(dashboard): add MSW mock handlers for orders, products, and stats"
```

---

## Task 3: Create useProtectedRoute Hook

**Files:**
- Create: `frontend/lib/hooks/useProtectedRoute.ts`
- Test: `frontend/__tests__/hooks/useProtectedRoute.test.tsx`

### Step 1: Write failing test

- [ ] **Create useProtectedRoute.test.tsx**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute'

// Mock useAuth
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/dashboard',
}))

const mockUser = { userId: 1, email: 'test@example.com' }
const mockUseAuth = vi.fn()
vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('useProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not redirect when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    })

    renderHook(() => useProtectedRoute())

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })

    renderHook(() => useProtectedRoute())

    expect(mockPush).toHaveBeenCalledWith('/login?returnTo=%2Fdashboard')
  })

  it('does not redirect while loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    })

    renderHook(() => useProtectedRoute())

    expect(mockPush).not.toHaveBeenCalled()
  })
})
```

### Step 2: Run test to verify it fails

- [ ] **Run test**

```bash
cd frontend && npm test -- useProtectedRoute.test.tsx
```

Expected: FAIL with "Cannot find module '@/lib/hooks/useProtectedRoute'"

### Step 3: Write minimal implementation

- [ ] **Create useProtectedRoute.ts**

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './useAuth'

export function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const returnTo = encodeURIComponent(pathname)
      router.push(`/login?returnTo=${returnTo}`)
    }
  }, [isAuthenticated, isLoading, router, pathname])
}
```

### Step 4: Run test to verify it passes

- [ ] **Run test**

```bash
cd frontend && npm test -- useProtectedRoute.test.tsx
```

Expected: PASS

### Step 5: Commit useProtectedRoute hook

- [ ] **Commit hook**

```bash
git add lib/hooks/useProtectedRoute.ts __tests__/hooks/useProtectedRoute.test.tsx
git commit -m "feat(dashboard): add useProtectedRoute hook with tests"
```

---

## Task 4: Create Header Component

**Files:**
- Create: `frontend/components/shared/Header.tsx`
- Test: `frontend/__tests__/components/Header.test.tsx`

### Step 1: Write failing test

- [ ] **Create Header.test.tsx**

```typescript
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from '@/components/shared/Header'

// Mock useAuth
vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { userId: 1, email: 'john@example.com' },
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}))

describe('Header', () => {
  it('renders logo', () => {
    render(<Header />)
    expect(screen.getByText('ShopHub')).toBeInTheDocument()
  })

  it('renders search bar', () => {
    render(<Header />)
    expect(screen.getByPlaceholderText(/search for luxury items/i)).toBeInTheDocument()
  })

  it('renders cart with badge', () => {
    render(<Header />)
    const cart = screen.getByRole('button', { name: /cart/i })
    expect(cart).toBeInTheDocument()
  })

  it('renders notifications button', () => {
    render(<Header />)
    const notifications = screen.getByRole('button', { name: /notifications/i })
    expect(notifications).toBeInTheDocument()
  })

  it('renders user menu with email initial', () => {
    render(<Header />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })
})
```

### Step 2: Run test to verify it fails

- [ ] **Run test**

```bash
cd frontend && npm test -- Header.test.tsx
```

Expected: FAIL with "Cannot find module '@/components/shared/Header'"

### Step 3: Write minimal implementation

- [ ] **Create Header.tsx**

```typescript
'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingBag, Bell, ChevronDown } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Header() {
  const { user } = useAuth()

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="font-display text-3xl font-bold bg-gradient-to-r from-accent via-accent-light to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            ShopHub
          </Link>

          {/* Search Bar (Hidden on mobile) */}
          <div className="hidden md:block flex-1 max-w-2xl mx-12">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for luxury items..."
                className="w-full h-12 pl-12 pr-4 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                aria-label="Search"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <button
              className="relative h-12 w-12 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
              aria-label="Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 bg-gradient-to-br from-accent to-accent-dark text-white text-xs font-bold rounded-full shadow-lg">
                2
              </span>
            </button>

            {/* Notifications */}
            <button
              className="relative h-12 w-12 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
              aria-label="Notifications"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-xl cursor-pointer transition-all">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-accent to-accent-dark shadow-lg">
                <span>{userInitial}</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-gray-900">
                  {user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-xs text-gray-500">Premium Member</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
```

### Step 4: Run test to verify it passes

- [ ] **Run test**

```bash
cd frontend && npm test -- Header.test.tsx
```

Expected: PASS

### Step 5: Commit Header component

- [ ] **Commit component**

```bash
git add components/shared/Header.tsx __tests__/components/Header.test.tsx
git commit -m "feat(dashboard): add Header component with tests"
```

---

## Task 5: Create Footer Component

**Files:**
- Create: `frontend/components/shared/Footer.tsx`
- Test: `frontend/__tests__/components/Footer.test.tsx`

### Step 1: Write failing test

- [ ] **Create Footer.test.tsx**

```typescript
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '@/components/shared/Footer'

describe('Footer', () => {
  it('renders copyright text', () => {
    render(<Footer />)
    expect(screen.getByText(/© 2026 ShopHub/i)).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: /about us/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /help center/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contact us/i })).toBeInTheDocument()
  })
})
```

### Step 2: Run test to verify it fails

- [ ] **Run test**

```bash
cd frontend && npm test -- Footer.test.tsx
```

Expected: FAIL with "Cannot find module '@/components/shared/Footer'"

### Step 3: Write minimal implementation

- [ ] **Create Footer.tsx**

```typescript
import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600 mb-6">
          <Link href="/about" className="hover:text-gray-900 transition-colors font-medium">
            About Us
          </Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors font-medium">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-gray-900 transition-colors font-medium">
            Terms of Service
          </Link>
          <Link href="/help" className="hover:text-gray-900 transition-colors font-medium">
            Help Center
          </Link>
          <Link href="/contact" className="hover:text-gray-900 transition-colors font-medium">
            Contact Us
          </Link>
        </nav>
        <p className="text-center text-sm text-gray-500">
          &copy; 2026 ShopHub. Crafted with excellence.
        </p>
      </div>
    </footer>
  )
}
```

### Step 4: Run test to verify it passes

- [ ] **Run test**

```bash
cd frontend && npm test -- Footer.test.tsx
```

Expected: PASS

### Step 5: Commit Footer component

- [ ] **Commit component**

```bash
git add components/shared/Footer.tsx __tests__/components/Footer.test.tsx
git commit -m "feat(dashboard): add Footer component with tests"
```

---

## Task 6: Create Dashboard Layout

**Files:**
- Create: `frontend/app/(dashboard)/layout.tsx`

### Step 1: Create dashboard layout

- [ ] **Create layout.tsx**

```typescript
import React from 'react'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-gray-900 focus:text-white focus:rounded"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  )
}
```

### Step 2: Commit dashboard layout

- [ ] **Commit layout**

```bash
git add app/\(dashboard\)/layout.tsx
git commit -m "feat(dashboard): add dashboard layout with Header and Footer"
```

---

## Task 7: Create OrderCard Component

**Files:**
- Create: `frontend/app/(dashboard)/dashboard/OrderCard.tsx`
- Test: `frontend/__tests__/components/OrderCard.test.tsx`

### Step 1: Write failing test

- [ ] **Create OrderCard.test.tsx**

```typescript
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import OrderCard from '@/app/(dashboard)/dashboard/OrderCard'
import type { Order } from '@/lib/types/order'

describe('OrderCard', () => {
  const mockOrder: Order = {
    orderId: '1234',
    userId: 1,
    status: 'shipped',
    items: [
      { productId: 1, name: 'T-Shirt', quantity: 1, price: 44.99 },
      { productId: 2, name: 'Wallet', quantity: 1, price: 45.00 },
    ],
    total: 89.99,
    createdAt: '2026-05-15T10:30:00Z',
    updatedAt: '2026-05-16T14:20:00Z',
  }

  it('renders order number', () => {
    render(<OrderCard order={mockOrder} />)
    expect(screen.getByText(/Order #1234/i)).toBeInTheDocument()
  })

  it('renders order date', () => {
    render(<OrderCard order={mockOrder} />)
    expect(screen.getByText(/may 15, 2026/i)).toBeInTheDocument()
  })

  it('renders shipped status badge', () => {
    render(<OrderCard order={mockOrder} />)
    expect(screen.getByText('Shipped')).toBeInTheDocument()
  })

  it('renders item count', () => {
    render(<OrderCard order={mockOrder} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders total price', () => {
    render(<OrderCard order={mockOrder} />)
    expect(screen.getByText('$89.99')).toBeInTheDocument()
  })

  it('renders Track Order button for shipped orders', () => {
    render(<OrderCard order={mockOrder} />)
    expect(screen.getByRole('button', { name: /track order/i })).toBeInTheDocument()
  })

  it('renders Buy Again button for delivered orders', () => {
    const deliveredOrder = { ...mockOrder, status: 'delivered' as const }
    render(<OrderCard order={deliveredOrder} />)
    expect(screen.getByRole('button', { name: /buy again/i })).toBeInTheDocument()
  })

  it('renders Complete Payment button for pending orders', () => {
    const pendingOrder = { ...mockOrder, status: 'pending' as const }
    render(<OrderCard order={pendingOrder} />)
    expect(screen.getByRole('button', { name: /complete payment/i })).toBeInTheDocument()
  })
})
```

### Step 2: Run test to verify it fails

- [ ] **Run test**

```bash
cd frontend && npm test -- OrderCard.test.tsx
```

Expected: FAIL with "Cannot find module"

### Step 3: Write minimal implementation

- [ ] **Create OrderCard.tsx**

```typescript
'use client'

import React from 'react'
import { Truck, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Order } from '@/lib/types/order'

interface OrderCardProps {
  order: Order
}

const STATUS_CONFIG = {
  shipped: {
    label: 'Shipped',
    icon: Truck,
    gradient: 'from-purple-400 to-purple-600',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    gradient: 'from-green-400 to-green-600',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    gradient: 'from-amber-400 to-amber-600',
  },
  cancelled: {
    label: 'Cancelled',
    icon: Clock,
    gradient: 'from-red-400 to-red-600',
  },
}

export default function OrderCard({ order }: OrderCardProps) {
  const statusConfig = STATUS_CONFIG[order.status]
  const StatusIcon = statusConfig.icon

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Card className="transition-all duration-300 hover:shadow-xl hover:border-accent/30 hover:-translate-y-1 bg-white border-gray-100 rounded-2xl">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-display text-xl font-bold text-gray-900 mb-1">
              Order #{order.orderId}
            </h3>
            <p className="text-sm text-gray-500">Placed on {formattedDate}</p>
          </div>
          <Badge
            className={`bg-gradient-to-br ${statusConfig.gradient} text-white border-0 px-4 py-2 gap-2`}
          >
            <StatusIcon className="w-4 h-4" />
            {statusConfig.label}
          </Badge>
        </div>

        <div className="flex items-center gap-6 pb-6 mb-6 border-b border-gray-100">
          <div>
            <p className="text-sm text-gray-600 mb-1">Items</p>
            <p className="text-lg font-bold text-gray-900">{order.items.length}</p>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="font-display text-3xl font-bold bg-gradient-to-r from-accent to-accent-dark bg-clip-text text-transparent">
              ${order.total.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          {order.status === 'shipped' && (
            <>
              <Button className="flex-1 bg-gradient-to-r from-accent to-accent-dark hover:opacity-90 shadow-lg">
                Track Order
              </Button>
              <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                Details
              </Button>
            </>
          )}
          {order.status === 'delivered' && (
            <>
              <Button variant="outline" className="flex-1 border-gray-200 hover:bg-gray-50">
                Buy Again
              </Button>
              <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                Details
              </Button>
            </>
          )}
          {order.status === 'pending' && (
            <>
              <Button className="flex-1 bg-gradient-to-r from-accent to-accent-dark hover:opacity-90 shadow-lg">
                Complete Payment
              </Button>
              <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Step 4: Run test to verify it passes

- [ ] **Run test**

```bash
cd frontend && npm test -- OrderCard.test.tsx
```

Expected: PASS

### Step 5: Commit OrderCard component

- [ ] **Commit component**

```bash
git add app/\(dashboard\)/dashboard/OrderCard.tsx __tests__/components/OrderCard.test.tsx
git commit -m "feat(dashboard): add OrderCard component with status badges"
```

---

## Task 8: Create QuickActions Component

**Files:**
- Create: `frontend/app/(dashboard)/dashboard/QuickActions.tsx`
- Test: `frontend/__tests__/components/QuickActions.test.tsx`

### Step 1: Write failing test

- [ ] **Create QuickActions.test.tsx**

```typescript
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import QuickActions from '@/app/(dashboard)/dashboard/QuickActions'

describe('QuickActions', () => {
  it('renders all 4 action buttons', () => {
    render(<QuickActions />)
    expect(screen.getByRole('button', { name: /shop now/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /track orders/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /wishlist/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sale items/i })).toBeInTheDocument()
  })

  it('renders with staggered animation classes', () => {
    const { container } = render(<QuickActions />)
    const buttons = container.querySelectorAll('button')
    expect(buttons[0]).toHaveClass('animate-scale-in')
    expect(buttons[1]).toHaveClass('animate-scale-in')
    expect(buttons[2]).toHaveClass('animate-scale-in')
    expect(buttons[3]).toHaveClass('animate-scale-in')
  })
})
```

### Step 2: Run test to verify it fails

- [ ] **Run test**

```bash
cd frontend && npm test -- QuickActions.test.tsx
```

Expected: FAIL with "Cannot find module"

### Step 3: Write minimal implementation

- [ ] **Create QuickActions.tsx**

```typescript
'use client'

import React from 'react'
import { ShoppingBag, Package, Heart, Gift } from 'lucide-react'

const ACTIONS = [
  { icon: ShoppingBag, label: 'Shop Now', gradient: 'from-yellow-400 to-yellow-600', rotate: '-rotate-6', delay: '0.1s' },
  { icon: Package, label: 'Track Orders', gradient: 'from-blue-400 to-blue-600', rotate: 'rotate-6', delay: '0.2s' },
  { icon: Heart, label: 'Wishlist', gradient: 'from-purple-400 to-purple-600', rotate: '-rotate-6', delay: '0.3s' },
  { icon: Gift, label: 'Sale Items', gradient: 'from-pink-400 to-pink-600', rotate: 'rotate-6', delay: '0.4s' },
]

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          className="h-28 px-6 bg-white rounded-2xl flex flex-col items-center justify-center gap-3 border-2 border-transparent hover:border-accent hover:-translate-y-1 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-accent/20 animate-scale-in"
          style={{ animationDelay: action.delay }}
        >
          <div
            className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center transform ${action.rotate} shadow-lg`}
          >
            <action.icon className="w-7 h-7 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-800">{action.label}</span>
        </button>
      ))}
    </div>
  )
}
```

### Step 4: Run test to verify it passes

- [ ] **Run test**

```bash
cd frontend && npm test -- QuickActions.test.tsx
```

Expected: PASS

### Step 5: Commit QuickActions component

- [ ] **Commit component**

```bash
git add app/\(dashboard\)/dashboard/QuickActions.tsx __tests__/components/QuickActions.test.tsx
git commit -m "feat(dashboard): add QuickActions component with gradient icons"
```

---

## Task 9: Create StatsCard Component

**Files:**
- Create: `frontend/app/(dashboard)/dashboard/StatsCard.tsx`
- Test: `frontend/__tests__/components/StatsCard.test.tsx`

### Step 1: Write failing test

- [ ] **Create StatsCard.test.tsx**

```typescript
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatsCard from '@/app/(dashboard)/dashboard/StatsCard'
import type { UserStats } from '@/lib/types/product'

describe('StatsCard', () => {
  const mockStats: UserStats = {
    ordersThisMonth: 5,
    totalSpent: 237.50,
    loyaltyPoints: 2450,
  }

  it('renders account stats title', () => {
    render(<StatsCard stats={mockStats} />)
    expect(screen.getByText('Account Stats')).toBeInTheDocument()
  })

  it('renders orders this month', () => {
    render(<StatsCard stats={mockStats} />)
    expect(screen.getByText('Orders this month')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders total spent with gold gradient', () => {
    render(<StatsCard stats={mockStats} />)
    expect(screen.getByText('Total spent')).toBeInTheDocument()
    expect(screen.getByText('$237.50')).toBeInTheDocument()
  })

  it('renders loyalty points', () => {
    render(<StatsCard stats={mockStats} />)
    expect(screen.getByText('Loyalty Points')).toBeInTheDocument()
    expect(screen.getByText('2,450')).toBeInTheDocument()
  })
})
```

### Step 2: Run test to verify it fails

- [ ] **Run test**

```bash
cd frontend && npm test -- StatsCard.test.tsx
```

Expected: FAIL with "Cannot find module"

### Step 3: Write minimal implementation

- [ ] **Create StatsCard.tsx**

```typescript
'use client'

import React from 'react'
import { ShoppingBag, DollarSign, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { UserStats } from '@/lib/types/product'

interface StatsCardProps {
  stats: UserStats
}

export default function StatsCard({ stats }: StatsCardProps) {
  return (
    <Card className="bg-white rounded-2xl shadow-lg border-gray-100">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-gray-900">Account Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg">
            <ShoppingBag className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Orders this month</p>
            <p className="font-display text-3xl font-bold text-gray-900">{stats.ordersThisMonth}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 shadow-lg">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total spent</p>
            <p className="font-display text-3xl font-bold bg-gradient-to-r from-accent to-accent-dark bg-clip-text text-transparent">
              ${stats.totalSpent.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 shadow-lg">
            <Star className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Loyalty Points</p>
            <p className="font-display text-3xl font-bold text-gray-900">
              {stats.loyaltyPoints.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Step 4: Run test to verify it passes

- [ ] **Run test**

```bash
cd frontend && npm test -- StatsCard.test.tsx
```

Expected: PASS

### Step 5: Commit StatsCard component

- [ ] **Commit component**

```bash
git add app/\(dashboard\)/dashboard/StatsCard.tsx __tests__/components/StatsCard.test.tsx
git commit -m "feat(dashboard): add StatsCard component with gradient icons"
```

---

## Task 10: Create ProductCard Component

**Files:**
- Create: `frontend/app/(dashboard)/dashboard/ProductCard.tsx`
- Test: `frontend/__tests__/components/ProductCard.test.tsx`

### Step 1: Write failing test

- [ ] **Create ProductCard.test.tsx**

```typescript
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductCard from '@/app/(dashboard)/dashboard/ProductCard'
import type { Product } from '@/lib/types/product'

describe('ProductCard', () => {
  const mockProduct: Product = {
    productId: 1,
    name: 'Premium Cotton T-Shirt',
    description: 'Luxuriously soft everyday essential',
    price: 24.99,
    rating: 4.5,
    reviewCount: 234,
    imageUrl: null,
    inStock: true,
  }

  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Premium Cotton T-Shirt')).toBeInTheDocument()
  })

  it('renders product description', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Luxuriously soft everyday essential')).toBeInTheDocument()
  })

  it('renders product price', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('$24.99')).toBeInTheDocument()
  })

  it('renders rating and review count', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('4.5 (234)')).toBeInTheDocument()
  })

  it('renders Add to Cart button', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
  })

  it('renders wishlist button', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByRole('button', { name: /add to wishlist/i })).toBeInTheDocument()
  })

  it('toggles wishlist icon on click', async () => {
    const user = userEvent.setup()
    const { container } = render(<ProductCard product={mockProduct} />)
    
    const wishlistButton = screen.getByRole('button', { name: /add to wishlist/i })
    
    // Initially not in wishlist (outlined heart)
    await user.click(wishlistButton)
    
    // After click, should be in wishlist (filled heart)
    expect(wishlistButton).toBeInTheDocument()
  })
})
```

### Step 2: Run test to verify it fails

- [ ] **Run test**

```bash
cd frontend && npm test -- ProductCard.test.tsx
```

Expected: FAIL with "Cannot find module"

### Step 3: Write minimal implementation

- [ ] **Create ProductCard.tsx**

```typescript
'use client'

import React, { useState } from 'react'
import { Heart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Product } from '@/lib/types/product'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(product.rating)
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${i < fullStars ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300 fill-gray-300'}`}
        />
      )
    }
    return stars
  }

  return (
    <Card className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-gray-100 group">
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="Add to wishlist"
        >
          <Heart
            className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
          />
        </button>
        <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <CardContent className="p-6">
        <h3 className="font-display text-xl font-bold text-gray-900 mb-2 hover:text-accent transition-colors cursor-pointer">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{product.description}</p>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">{renderStars()}</div>
          <span className="text-sm font-semibold text-gray-700">
            {product.rating} ({product.reviewCount})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-display text-3xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <Button className="bg-gradient-to-r from-accent to-accent-dark hover:opacity-90 shadow-lg hover:scale-110 transition-all">
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Step 4: Run test to verify it passes

- [ ] **Run test**

```bash
cd frontend && npm test -- ProductCard.test.tsx
```

Expected: PASS

### Step 5: Commit ProductCard component

- [ ] **Commit component**

```bash
git add app/\(dashboard\)/dashboard/ProductCard.tsx __tests__/components/ProductCard.test.tsx
git commit -m "feat(dashboard): add ProductCard component with wishlist toggle"
```

---

## Task 11: Create Dashboard Page

**Files:**
- Create: `frontend/app/(dashboard)/dashboard/page.tsx`

### Step 1: Create dashboard page

- [ ] **Create page.tsx**

```typescript
'use client'

import React, { useEffect, useState } from 'react'
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute'
import { useAuth } from '@/lib/hooks/useAuth'
import OrderCard from './OrderCard'
import QuickActions from './QuickActions'
import StatsCard from './StatsCard'
import ProductCard from './ProductCard'
import type { Order } from '@/lib/types/order'
import type { Product, UserStats } from '@/lib/types/product'

export default function DashboardPage() {
  useProtectedRoute()
  
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const token = localStorage.getItem('token')
        
        const [ordersRes, productsRes, statsRes] = await Promise.all([
          fetch('/api/v1/orders', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/v1/products/recommendations', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/v1/users/stats', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const ordersData = await ordersRes.json()
        const productsData = await productsRes.json()
        const statsData = await statsRes.json()

        setOrders(ordersData.orders || [])
        setProducts(productsData.products || [])
        setStats(statsData)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  const userName = user?.email?.split('@')[0] || 'there'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome Section */}
      <div className="mb-12 animate-fade-in-up">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-5xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Welcome back, {userName}
            </h1>
            <p className="text-lg text-gray-600">Your personalized luxury shopping experience</p>
          </div>
          <div className="hidden lg:block">
            <div className="text-right">
              <div className="text-sm text-gray-500">Member since</div>
              <div className="font-display text-2xl font-bold text-gray-900">Jan 2026</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <QuickActions />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Recent Orders */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl font-bold text-gray-900">Recent Orders</h2>
              <a
                href="/orders"
                className="text-sm font-bold text-gray-700 hover:text-accent transition-colors flex items-center gap-2"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="space-y-6">
              {orders.map((order) => (
                <OrderCard key={order.orderId} order={order} />
              ))}
            </div>
          </section>

          {/* Recommended Products */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl font-bold text-gray-900">Curated for You</h2>
              <a
                href="/products"
                className="text-sm font-bold text-gray-700 hover:text-accent transition-colors flex items-center gap-2"
              >
                Browse More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="grid sm:grid-cols-2 gap-8">
              {products.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {stats && <StatsCard stats={stats} />}
        </aside>
      </div>
    </div>
  )
}
```

### Step 2: Commit dashboard page

- [ ] **Commit page**

```bash
git add app/\(dashboard\)/dashboard/page.tsx
git commit -m "feat(dashboard): add dashboard page with route protection and data fetching"
```

---

## Task 12: Integration Tests

**Files:**
- Create: `frontend/__tests__/integration/dashboard-access.test.tsx`

### Step 1: Write integration tests

- [ ] **Create dashboard-access.test.tsx**

```typescript
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import DashboardPage from '@/app/(dashboard)/dashboard/page'

// Mock useRouter
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/dashboard',
}))

// Mock useAuth
const mockUseAuth = vi.fn()
vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock fetch
global.fetch = vi.fn()

describe('Dashboard Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('token', 'mock-jwt-token-12345')
  })

  it('authenticated user sees dashboard content', async () => {
    mockUseAuth.mockReturnValue({
      user: { userId: 1, email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
    })

    vi.mocked(fetch).mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/orders')) {
        return Promise.resolve({
          json: () => Promise.resolve({ orders: [] }),
        } as Response)
      }
      if (typeof url === 'string' && url.includes('/products')) {
        return Promise.resolve({
          json: () => Promise.resolve({ products: [] }),
        } as Response)
      }
      if (typeof url === 'string' && url.includes('/stats')) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              ordersThisMonth: 5,
              totalSpent: 237.50,
              loyaltyPoints: 2450,
            }),
        } as Response)
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/welcome back, test/i)).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('unauthenticated user redirects to login', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })

    render(<DashboardPage />)

    expect(mockPush).toHaveBeenCalledWith('/login?returnTo=%2Fdashboard')
  })

  it('after login, user can access dashboard', async () => {
    mockUseAuth.mockReturnValue({
      user: { userId: 1, email: 'john@example.com' },
      isAuthenticated: true,
      isLoading: false,
    })

    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            orders: [],
            products: [],
            ordersThisMonth: 0,
            totalSpent: 0,
            loyaltyPoints: 0,
          }),
      } as Response)
    )

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/welcome back, john/i)).toBeInTheDocument()
    })
  })
})
```

### Step 2: Run integration tests

- [ ] **Run tests**

```bash
cd frontend && npm test -- dashboard-access.test.tsx
```

Expected: PASS

### Step 3: Commit integration tests

- [ ] **Commit tests**

```bash
git add __tests__/integration/dashboard-access.test.tsx
git commit -m "test(dashboard): add integration tests for dashboard access control"
```

---

## Task 13: E2E Tests

**Files:**
- Create: `frontend/e2e/dashboard.spec.ts`

### Step 1: Write E2E tests

- [ ] **Create dashboard.spec.ts**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'Test123!@#')
    await page.click('button:has-text("Sign In")')
    await page.waitForURL('/dashboard')
  })

  test('displays welcome message with user name', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Welcome back, test')
  })

  test('displays quick actions', async ({ page }) => {
    await expect(page.locator('button:has-text("Shop Now")')).toBeVisible()
    await expect(page.locator('button:has-text("Track Orders")')).toBeVisible()
    await expect(page.locator('button:has-text("Wishlist")')).toBeVisible()
    await expect(page.locator('button:has-text("Sale Items")')).toBeVisible()
  })

  test('displays recent orders section', async ({ page }) => {
    await expect(page.locator('h2:has-text("Recent Orders")')).toBeVisible()
    await expect(page.locator('text=Order #1234')).toBeVisible()
  })

  test('displays curated products section', async ({ page }) => {
    await expect(page.locator('h2:has-text("Curated for You")')).toBeVisible()
    await expect(page.locator('text=Premium Cotton T-Shirt')).toBeVisible()
  })

  test('displays account stats', async ({ page }) => {
    await expect(page.locator('text=Account Stats')).toBeVisible()
    await expect(page.locator('text=Orders this month')).toBeVisible()
    await expect(page.locator('text=5')).toBeVisible()
  })

  test('order card hover animation works', async ({ page }) => {
    const orderCard = page.locator('text=Order #1234').locator('..')
    await orderCard.hover()
    await expect(orderCard).toHaveCSS('transform', /translateY/)
  })

  test('quick action buttons are clickable', async ({ page }) => {
    const shopNowButton = page.locator('button:has-text("Shop Now")')
    await expect(shopNowButton).toBeEnabled()
    await shopNowButton.click()
  })

  test('product wishlist toggle works', async ({ page }) => {
    const wishlistButton = page.locator('button[aria-label="Add to wishlist"]').first()
    await wishlistButton.click()
    // Heart should be filled after click
    await expect(wishlistButton.locator('svg')).toHaveClass(/fill-red-500/)
  })
})
```

### Step 2: Run E2E tests

- [ ] **Run E2E tests**

```bash
cd frontend && npx playwright test dashboard.spec.ts
```

Expected: PASS (8 tests)

### Step 3: Commit E2E tests

- [ ] **Commit E2E tests**

```bash
git add e2e/dashboard.spec.ts
git commit -m "test(dashboard): add E2E tests for dashboard functionality"
```

---

## Task 14: Visual Regression Tests (Dashboard)

**Files:**
- Create: `frontend/e2e/visual/dashboard.visual.spec.ts`

### Step 1: Write visual regression tests

- [ ] **Create dashboard.visual.spec.ts**

```typescript
import { test, expect, devices } from '@playwright/test'

test.describe('Dashboard Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'Test123!@#')
    await page.click('button:has-text("Sign In")')
    await page.waitForURL('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('dashboard desktop view', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page).toHaveScreenshot('dashboard-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('dashboard mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('dashboard tablet view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page).toHaveScreenshot('dashboard-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('order card hover state', async ({ page }) => {
    const orderCard = page.locator('text=Order #1234').locator('..')
    await orderCard.hover()
    await expect(orderCard).toHaveScreenshot('order-card-hover.png')
  })

  test('quick actions hover state', async ({ page }) => {
    const shopNowButton = page.locator('button:has-text("Shop Now")')
    await shopNowButton.hover()
    await expect(shopNowButton).toHaveScreenshot('quick-action-hover.png')
  })

  test('product card hover state', async ({ page }) => {
    const productCard = page.locator('text=Premium Cotton T-Shirt').locator('..')
    await productCard.hover()
    await expect(productCard).toHaveScreenshot('product-card-hover.png')
  })

  test('wishlist active state', async ({ page }) => {
    const wishlistButton = page.locator('button[aria-label="Add to wishlist"]').first()
    await wishlistButton.click()
    await expect(wishlistButton).toHaveScreenshot('wishlist-active.png')
  })
})
```

### Step 2: Generate baseline screenshots

- [ ] **Generate baselines**

```bash
cd frontend && npx playwright test dashboard.visual.spec.ts --update-snapshots
```

Expected: 7 baseline screenshots created

### Step 3: Commit visual regression tests and baselines

- [ ] **Commit tests and screenshots**

```bash
git add e2e/visual/dashboard.visual.spec.ts e2e/visual/dashboard.visual.spec.ts-snapshots/
git commit -m "test(dashboard): add visual regression tests with baselines"
```

---

## Task 15: Visual Regression Tests (Responsive)

**Files:**
- Create: `frontend/e2e/visual/responsive.visual.spec.ts`

### Step 1: Write responsive tests

- [ ] **Create responsive.visual.spec.ts**

```typescript
import { test, expect } from '@playwright/test'

const BREAKPOINTS = [
  { name: 'mobile-sm', width: 320, height: 568 },
  { name: 'mobile-md', width: 375, height: 667 },
  { name: 'mobile-lg', width: 414, height: 896 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop-sm', width: 1024, height: 768 },
  { name: 'desktop-md', width: 1440, height: 900 },
  { name: 'desktop-lg', width: 1920, height: 1080 },
]

test.describe('Responsive Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'Test123!@#')
    await page.click('button:has-text("Sign In")')
    await page.waitForURL('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  for (const breakpoint of BREAKPOINTS) {
    test(`dashboard at ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`, async ({ page }) => {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })
      await expect(page).toHaveScreenshot(`dashboard-${breakpoint.name}.png`, {
        fullPage: true,
        animations: 'disabled',
      })
    })
  }
})
```

### Step 2: Generate baseline screenshots

- [ ] **Generate baselines**

```bash
cd frontend && npx playwright test responsive.visual.spec.ts --update-snapshots
```

Expected: 7 baseline screenshots created

### Step 3: Commit responsive tests and baselines

- [ ] **Commit tests and screenshots**

```bash
git add e2e/visual/responsive.visual.spec.ts e2e/visual/responsive.visual.spec.ts-snapshots/
git commit -m "test(dashboard): add responsive visual regression tests"
```

---

## Task 16: Update README

**Files:**
- Modify: `frontend/README.md`

### Step 1: Update implementation status

- [ ] **Update README.md**

Add to the Implementation Status section:

```markdown
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
```

### Step 2: Commit README update

- [ ] **Commit README**

```bash
git add README.md
git commit -m "docs: update README with Part C completion status"
```

---

## Summary

**Total Tasks:** 16
**Total Steps:** 84
**Estimated Time:** 4-5 hours

**Key Deliverables:**
- Protected dashboard with route guard
- Header and Footer components
- 4 dashboard components (OrderCard, QuickActions, StatsCard, ProductCard)
- MSW mock endpoints for dashboard data
- 30 comprehensive tests (unit, integration, E2E, visual regression, responsive)
- Full luxury aesthetic with animations and hover effects
- 100% accessibility support

**Test Coverage:**
- Unit: 6 component tests + 1 hook test = 7 tests
- Integration: 1 test file with 3 test cases
- E2E: 8 tests
- Visual Regression: 7 dashboard tests + 7 responsive tests = 14 tests
- **Total: 30+ test cases**

**All tests follow TDD approach:** Write failing test → Run to verify failure → Implement minimum code → Run to verify pass → Commit
