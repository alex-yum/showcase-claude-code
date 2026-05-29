import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute'
import { authClient } from '@/lib/auth/client'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock('@/lib/auth/client', () => ({
  authClient: {
    isAuthenticated: vi.fn(),
  },
}))

describe('useProtectedRoute', () => {
  const mockPush = vi.fn()
  const mockRouter = { push: mockPush }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.mocked(useRouter).mockReturnValue(mockRouter as any)
    vi.mocked(usePathname).mockReturnValue('/dashboard')
    vi.mocked(authClient.isAuthenticated).mockReturnValue(false)
  })

  it('redirects to login when not authenticated', () => {
    vi.mocked(authClient.isAuthenticated).mockReturnValue(false)

    renderHook(() => useProtectedRoute())

    expect(mockPush).toHaveBeenCalledWith('/login?returnTo=%2Fdashboard')
  })

  it('does not redirect when authenticated', () => {
    vi.mocked(authClient.isAuthenticated).mockReturnValue(true)

    renderHook(() => useProtectedRoute())

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('saves current path as returnTo', () => {
    vi.mocked(usePathname).mockReturnValue('/profile/settings')
    vi.mocked(authClient.isAuthenticated).mockReturnValue(false)

    renderHook(() => useProtectedRoute())

    expect(mockPush).toHaveBeenCalledWith('/login?returnTo=%2Fprofile%2Fsettings')
  })
})
