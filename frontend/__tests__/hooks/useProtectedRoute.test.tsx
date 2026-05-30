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
