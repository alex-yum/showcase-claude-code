# Frontend Part A: Infrastructure + Auth System

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Setup Next.js 15 infrastructure and implement complete auth system (API client, auth context, hooks) with 100% test coverage.

**Architecture:** Next.js 15 Server Components + localStorage auth. Centralized API client. MSW mocks all requests. TDD throughout.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.7, Tailwind 3.4, shadcn/ui, MSW 2.x, Vitest 2.x

**Deliverable:** Working infrastructure ready for UI components + complete auth system tested end-to-end.

---

**Related Plans:**
- **Part B**: Login Page + Tests (depends on Part A)
- **Part C**: Dashboard + Tests (depends on Part A)

---

## File Structure Overview

This plan creates:

**Infrastructure:**
- `frontend/package.json`, `tailwind.config.ts`, `vitest.config.ts`, `playwright.config.ts`
- `frontend/app/layout.tsx` (root with fonts)
- `frontend/components/ui/*` (shadcn/ui button, input, card, badge)
- `frontend/mocks/*` (MSW handlers, browser, server)

**Auth System:**
- `frontend/lib/types/auth.ts` - TypeScript types
- `frontend/lib/api/config.ts` - API configuration
- `frontend/lib/api/client.ts` - ApiClient class
- `frontend/lib/api/auth.ts` - authApi methods
- `frontend/lib/auth/client.ts` - authClient (localStorage)
- `frontend/lib/auth/context.tsx` - AuthContext provider
- `frontend/lib/hooks/useAuth.ts` - useAuth hook
- `frontend/lib/hooks/useProtectedRoute.ts` - Route protection
- `frontend/lib/utils/validators.ts` - Zod schemas

**Tests:**
- Unit tests for all lib/ modules
- Integration tests for auth flow
- 100% coverage enforced

---

[Tasks 1-12 content from previous plan - already written above]

---

## Task 13: Create ApiClient Class

**Files:**
- Create: `frontend/lib/api/client.ts`

- [ ] **Step 1: Write failing test**

Create `frontend/__tests__/lib/api/client.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ApiClient } from '@/lib/api/client'

describe('ApiClient', () => {
  let client: ApiClient
  
  beforeEach(() => {
    client = new ApiClient()
  })

  it('creates instance with default baseURL', () => {
    expect(client).toBeInstanceOf(ApiClient)
  })

  it('makes GET request', async () => {
    const result = await client.get<{ valid: boolean }>('/api/v1/auth/validate')
    expect(result).toHaveProperty('valid')
  })

  it('makes POST request with body', async () => {
    const result = await client.post('/api/v1/auth/login', {
      email: 'test@example.com',
      password: 'Test123!@#',
    })
    expect(result).toHaveProperty('accessToken')
  })

  it('throws error on 401', async () => {
    await expect(
      client.post('/api/v1/auth/login', {
        email: 'wrong@example.com',
        password: 'wrong',
      })
    ).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:run
```

Expected: FAIL - "Cannot find module '@/lib/api/client'"

- [ ] **Step 3: Create ApiClient**

Create `frontend/lib/api/client.ts`:

```typescript
import { API_CONFIG } from './config'

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: any,
    message?: string
  ) {
    super(message || 'API Error')
    this.name = 'ApiError'
  }
}

export class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_CONFIG.baseURL) {
    this.baseURL = baseURL
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(response.status, data, data.message)
    }

    return data as T
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }
}

export const apiClient = new ApiClient()
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm run test:run
```

Expected: PASS - All ApiClient tests pass

- [ ] **Step 5: Commit**

```bash
git add lib/api/client.ts __tests__/lib/api/client.test.ts
git commit -m "feat: add ApiClient class with error handling"
```

---

## Task 14: Create Auth API Methods

**Files:**
- Create: `frontend/lib/api/auth.ts`

- [ ] **Step 1: Write failing test**

Create `frontend/__tests__/lib/api/auth.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { authApi } from '@/lib/api/auth'
import type { LoginRequest } from '@/lib/types/auth'

describe('authApi', () => {
  it('login() returns access token on success', async () => {
    const request: LoginRequest = {
      email: 'test@example.com',
      password: 'Test123!@#',
    }
    
    const response = await authApi.login(request)
    
    expect(response.accessToken).toBe('mock-jwt-token')
    expect(response.tokenType).toBe('Bearer')
    expect(response.userId).toBe(1)
  })

  it('login() throws on invalid credentials', async () => {
    const request: LoginRequest = {
      email: 'wrong@example.com',
      password: 'wrong',
    }
    
    await expect(authApi.login(request)).rejects.toThrow()
  })

  it('logout() returns success message', async () => {
    const response = await authApi.logout()
    expect(response.message).toBe('Logged out successfully')
  })

  it('validate() returns user data with valid token', async () => {
    const response = await authApi.validate('mock-jwt-token')
    expect(response.valid).toBe(true)
    expect(response.userId).toBe(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:run
```

Expected: FAIL - "Cannot find module '@/lib/api/auth'"

- [ ] **Step 3: Create authApi**

Create `frontend/lib/api/auth.ts`:

```typescript
import { apiClient } from './client'
import { API_CONFIG } from './config'
import type { LoginRequest, LoginResponse, ValidateResponse } from '@/lib/types/auth'

export const authApi = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(
      `${API_CONFIG.authService}/login`,
      request
    )
  },

  async logout(): Promise<{ message: string }> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return apiClient.post<{ message: string }>(
      `${API_CONFIG.authService}/logout`,
      undefined,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    )
  },

  async validate(token: string): Promise<ValidateResponse> {
    return apiClient.get<ValidateResponse>(
      `${API_CONFIG.authService}/validate`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
  },
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm run test:run
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/api/auth.ts __tests__/lib/api/auth.test.ts
git commit -m "feat: add authApi methods (login/logout/validate)"
```

---

## Task 15: Create Auth Client (localStorage abstraction)

**Files:**
- Create: `frontend/lib/auth/client.ts`

- [ ] **Step 1: Write failing test**

Create `frontend/__tests__/lib/auth/client.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { authClient } from '@/lib/auth/client'
import type { LoginResponse } from '@/lib/types/auth'

describe('authClient', () => {
  const mockResponse: LoginResponse = {
    accessToken: 'test-token',
    tokenType: 'Bearer',
    expiresIn: 86400000,
    userId: 1,
    email: 'test@example.com',
  }

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('saves token to localStorage on login', () => {
    authClient.login(mockResponse)
    expect(localStorage.getItem('token')).toBe('test-token')
  })

  it('saves user data to localStorage', () => {
    authClient.login(mockResponse)
    const userData = localStorage.getItem('user')
    expect(userData).toBeTruthy()
    const user = JSON.parse(userData!)
    expect(user.userId).toBe(1)
    expect(user.email).toBe('test@example.com')
  })

  it('getToken() returns stored token', () => {
    localStorage.setItem('token', 'stored-token')
    expect(authClient.getToken()).toBe('stored-token')
  })

  it('getToken() returns null when no token', () => {
    expect(authClient.getToken()).toBeNull()
  })

  it('getUser() returns stored user', () => {
    const user = { userId: 1, email: 'test@example.com' }
    localStorage.setItem('user', JSON.stringify(user))
    expect(authClient.getUser()).toEqual(user)
  })

  it('isAuthenticated() returns true when token exists', () => {
    localStorage.setItem('token', 'test-token')
    expect(authClient.isAuthenticated()).toBe(true)
  })

  it('isAuthenticated() returns false when no token', () => {
    expect(authClient.isAuthenticated()).toBe(false)
  })

  it('logout() clears token and user', () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ userId: 1 }))
    
    authClient.logout()
    
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:run
```

Expected: FAIL - "Cannot find module '@/lib/auth/client'"

- [ ] **Step 3: Create authClient**

Create `frontend/lib/auth/client.ts`:

```typescript
import type { LoginResponse, User } from '@/lib/types/auth'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const authClient = {
  login(response: LoginResponse): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(TOKEN_KEY, response.accessToken)
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        userId: response.userId,
        email: response.email,
      })
    )
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null
    const userData = localStorage.getItem(USER_KEY)
    return userData ? JSON.parse(userData) : null
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null
  },

  logout(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm run test:run
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/auth/client.ts __tests__/lib/auth/client.test.ts
git commit -m "feat: add authClient localStorage abstraction"
```

---

## Task 16: Create AuthContext Provider

**Files:**
- Create: `frontend/lib/auth/context.tsx`

- [ ] **Step 1: Write failing test**

Create `frontend/__tests__/lib/auth/context.test.tsx`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/lib/auth/context'

function TestComponent() {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  return (
    <div>
      <div>Loading: {isLoading ? 'yes' : 'no'}</div>
      <div>Authenticated: {isAuthenticated ? 'yes' : 'no'}</div>
      <div>User: {user?.email || 'none'}</div>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('provides auth state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    expect(screen.getByText(/Loading: no/)).toBeInTheDocument()
    expect(screen.getByText(/Authenticated: no/)).toBeInTheDocument()
  })

  it('reads user from localStorage on mount', async () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ userId: 1, email: 'test@example.com' }))
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByText(/Authenticated: yes/)).toBeInTheDocument()
      expect(screen.getByText(/User: test@example.com/)).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:run
```

Expected: FAIL - "Cannot find module '@/lib/auth/context'"

- [ ] **Step 3: Create AuthContext**

Create `frontend/lib/auth/context.tsx`:

```typescript
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authClient } from './client'
import { authApi } from '../api/auth'
import type { User, LoginRequest } from '../types/auth'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = authClient.getUser()
    if (storedUser) {
      setUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials)
    authClient.login(response)
    setUser({ userId: response.userId, email: response.email })
  }

  const logout = async () => {
    await authApi.logout()
    authClient.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm run test:run
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/auth/context.tsx __tests__/lib/auth/context.test.tsx
git commit -m "feat: add AuthContext provider"
```

---

## Task 17: Create useAuth Hook

**Files:**
- Create: `frontend/lib/hooks/useAuth.ts`
- Note: This exports the hook from context for convenience

- [ ] **Step 1: Write failing test**

Create `frontend/__tests__/hooks/useAuth.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AuthProvider } from '@/lib/auth/context'
import { useAuth } from '@/lib/hooks/useAuth'

describe('useAuth hook', () => {
  it('returns auth context values', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })
    
    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('isAuthenticated')
    expect(result.current).toHaveProperty('login')
    expect(result.current).toHaveProperty('logout')
  })

  it('login() updates user state', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })
    
    await result.current.login({
      email: 'test@example.com',
      password: 'Test123!@#',
    })
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user?.email).toBe('test@example.com')
    })
  })

  it('logout() clears user state', async () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ userId: 1, email: 'test@example.com' }))
    
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })
    
    await result.current.logout()
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:run
```

Expected: FAIL - "Cannot find module '@/lib/hooks/useAuth'"

- [ ] **Step 3: Create useAuth hook**

Create `frontend/lib/hooks/useAuth.ts`:

```typescript
// Re-export useAuth from context for convenience
export { useAuth } from '../auth/context'
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm run test:run
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/hooks/useAuth.ts __tests__/hooks/useAuth.test.tsx
git commit -m "feat: add useAuth hook"
```

---

## Task 18: Create useProtectedRoute Hook

**Files:**
- Create: `frontend/lib/hooks/useProtectedRoute.ts`

- [ ] **Step 1: Write failing test**

Create `frontend/__tests__/hooks/useProtectedRoute.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute'
import { authClient } from '@/lib/auth/client'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

describe('useProtectedRoute', () => {
  const mockPush = vi.fn()
  const mockRouter = { push: mockPush }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.mocked(useRouter).mockReturnValue(mockRouter as any)
    vi.mocked(usePathname).mockReturnValue('/dashboard')
  })

  it('redirects to login when not authenticated', () => {
    renderHook(() => useProtectedRoute())
    
    expect(mockPush).toHaveBeenCalledWith('/login?returnTo=/dashboard')
  })

  it('does not redirect when authenticated', () => {
    localStorage.setItem('token', 'test-token')
    
    renderHook(() => useProtectedRoute())
    
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('saves current path as returnTo', () => {
    vi.mocked(usePathname).mockReturnValue('/profile/settings')
    
    renderHook(() => useProtectedRoute())
    
    expect(mockPush).toHaveBeenCalledWith('/login?returnTo=/profile/settings')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:run
```

Expected: FAIL - "Cannot find module '@/lib/hooks/useProtectedRoute'"

- [ ] **Step 3: Create useProtectedRoute**

Create `frontend/lib/hooks/useProtectedRoute.ts`:

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authClient } from '../auth/client'

export function useProtectedRoute() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!authClient.isAuthenticated()) {
      const returnTo = encodeURIComponent(pathname)
      router.push(`/login?returnTo=${returnTo}`)
    }
  }, [router, pathname])
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm run test:run
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/hooks/useProtectedRoute.ts __tests__/hooks/useProtectedRoute.test.tsx
git commit -m "feat: add useProtectedRoute hook"
```

---

## Task 19: Create Zod Validation Schemas

**Files:**
- Create: `frontend/lib/utils/validators.ts`

- [ ] **Step 1: Write failing test**

Create `frontend/__tests__/lib/utils/validators.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { loginSchema } from '@/lib/utils/validators'

describe('loginSchema', () => {
  it('validates correct login data', () => {
    const data = {
      email: 'test@example.com',
      password: 'Test123!@#',
      rememberMe: true,
    }
    
    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const data = {
      email: 'not-an-email',
      password: 'Test123!@#',
    }
    
    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('rejects password without uppercase', () => {
    const data = {
      email: 'test@example.com',
      password: 'test123!@#',
    }
    
    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects password without lowercase', () => {
    const data = {
      email: 'test@example.com',
      password: 'TEST123!@#',
    }
    
    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects password without digit', () => {
    const data = {
      email: 'test@example.com',
      password: 'TestABC!@#',
    }
    
    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects password without special character', () => {
    const data = {
      email: 'test@example.com',
      password: 'Test123456',
    }
    
    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 8 characters', () => {
    const data = {
      email: 'test@example.com',
      password: 'Te12!@',
    }
    
    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:run
```

Expected: FAIL - "Cannot find module '@/lib/utils/validators'"

- [ ] **Step 3: Create validators**

Create `frontend/lib/utils/validators.ts`:

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Valid email required'),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'At least one uppercase letter required')
    .regex(/[a-z]/, 'At least one lowercase letter required')
    .regex(/[0-9]/, 'At least one digit required')
    .regex(/[^A-Za-z0-9]/, 'At least one special character required'),
  rememberMe: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm run test:run
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/utils/validators.ts __tests__/lib/utils/validators.test.ts
git commit -m "feat: add Zod validation schemas for login"
```

---

## Task 20: Update Root Layout with AuthProvider

**Files:**
- Modify: `frontend/app/layout.tsx`

- [ ] **Step 1: Add AuthProvider to root layout**

Edit `frontend/app/layout.tsx`, wrap children with AuthProvider:

```typescript
import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import { AuthProvider } from '@/lib/auth/context'
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
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Test build**

Run:

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wrap root layout with AuthProvider"
```

---

## Task 21: Integration Test - Complete Login Flow

**Files:**
- Create: `frontend/__tests__/integration/login-flow.test.tsx`

- [ ] **Step 1: Write integration test**

Create `frontend/__tests__/integration/login-flow.test.tsx`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AuthProvider } from '@/lib/auth/context'
import { useAuth } from '@/lib/hooks/useAuth'

describe('Login Flow Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('completes full login flow', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })
    
    // Initially not authenticated
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    
    // Perform login
    await result.current.login({
      email: 'test@example.com',
      password: 'Test123!@#',
      rememberMe: true,
    })
    
    // Check authentication state
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual({
        userId: 1,
        email: 'test@example.com',
      })
    })
    
    // Check localStorage
    expect(localStorage.getItem('token')).toBe('mock-jwt-token')
    const userData = localStorage.getItem('user')
    expect(userData).toBeTruthy()
    const user = JSON.parse(userData!)
    expect(user.userId).toBe(1)
    
    // Perform logout
    await result.current.logout()
    
    // Check state cleared
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })
    
    // Check localStorage cleared
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('handles login failure', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })
    
    // Attempt login with wrong credentials
    await expect(
      result.current.login({
        email: 'wrong@example.com',
        password: 'wrong',
      })
    ).rejects.toThrow()
    
    // User should not be authenticated
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })
})
```

- [ ] **Step 2: Run test**

Run:

```bash
npm run test:run
```

Expected: PASS - Full login flow works end-to-end

- [ ] **Step 3: Commit**

```bash
git add __tests__/integration/login-flow.test.tsx
git commit -m "test: add login flow integration test"
```

---

## Task 22: Verify 100% Test Coverage

**Files:**
- None (verification only)

- [ ] **Step 1: Run coverage report**

Run:

```bash
npm run test:coverage
```

Expected: 100% coverage for all lib/ modules (statements, branches, functions, lines)

- [ ] **Step 2: Review coverage report**

Open `frontend/coverage/index.html` in browser. Verify all files show 100% coverage.

- [ ] **Step 3: Document test credentials**

Create `frontend/README.md`:

```markdown
# ShopHub Frontend

Luxury e-commerce platform built with Next.js 15.

## Test Credentials

For MSW mocked authentication:
- **Email**: test@example.com
- **Password**: Test123!@#

## Development

\`\`\`bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests
npm run test:coverage # Coverage report
\`\`\`

## Architecture

- **Next.js 15** with App Router
- **React Server Components** by default
- **Client Components** for interactivity
- **MSW** mocks all API calls
- **100% test coverage** enforced
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add README with test credentials"
```

---

## Verification

**Before moving to Part B, verify:**

- [ ] `npm run test:run` passes with 100% coverage
- [ ] `npm run build` succeeds
- [ ] All auth system components tested
- [ ] MSW handlers work for login/logout/validate
- [ ] AuthProvider loads user from localStorage on mount
- [ ] useProtectedRoute redirects when not authenticated

**Run final checks:**

```bash
cd frontend
npm run test:coverage
npm run build
```

Expected: All tests pass, build succeeds, 100% coverage achieved.

---

## Next Steps

**Ready for Part B: Login Page + Tests**

Part B will implement:
- Auth layout with luxury background
- Login page wrapper (Server Component)
- LoginForm component (Client Component with React Hook Form)
- Unit tests for LoginForm
- E2E tests for login flow
- Visual regression tests

Part B depends on all infrastructure and auth system from Part A.

---

## Notes

**What this plan delivers:**
- Complete Next.js 15 infrastructure
- Tailwind with luxury theme
- shadcn/ui components customized
- MSW mocking all auth endpoints
- Complete auth system (API, client, context, hooks)
- 100% test coverage
- Ready for UI components

**Test credentials (MSW):**
- Email: test@example.com
- Password: Test123!@#

**Auth flow:**
- localStorage-based (migrates to cookies next sprint)
- Centralized API client
- AuthContext provides app-wide auth state
- useProtectedRoute for route protection
