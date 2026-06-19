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

// Mock useMSW - controlled per test
const mockUseMSW = vi.fn()
vi.mock('@/app/msw-provider', () => ({
  useMSW: () => mockUseMSW(),
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

describe('Dashboard Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('token', 'mock-jwt-token-12345')
    // Default: MSW is ready
    mockUseMSW.mockReturnValue({ mswReady: true })
  })

  it('authenticated user sees dashboard content', async () => {
    mockUseAuth.mockReturnValue({
      user: { userId: 1, email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
    })

    mockFetch.mockImplementation((url) => {
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

    mockFetch.mockImplementation(() =>
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

  it('does not fetch data before MSW is ready (page reload race condition)', () => {
    mockUseMSW.mockReturnValue({ mswReady: false })
    mockUseAuth.mockReturnValue({
      user: { userId: 1, email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
    })

    render(<DashboardPage />)

    // fetch must NOT be called while MSW is still initializing
    expect(mockFetch).not.toHaveBeenCalled()
    // Loading spinner is shown while waiting for MSW
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
