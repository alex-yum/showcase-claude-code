import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '@/app/(auth)/login/LoginForm'

// Mock authApi
vi.mock('@/lib/api/auth', () => ({
  authApi: {
    login: vi.fn(),
  },
}))

// Mock useRouter
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: vi.fn(() => null),
  }),
}))

// Mock useAuth
const mockLogin = vi.fn()
vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isAuthenticated: false,
    logout: vi.fn(),
  }),
}))

describe('LoginForm - Complete Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('completes full login flow: form → API → context → redirect', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      accessToken: 'mock-jwt-token',
      tokenType: 'Bearer',
      expiresIn: 86400000,
      userId: 1,
      email: 'test@example.com',
    }

    const { authApi } = await import('@/lib/api/auth')
    vi.mocked(authApi.login).mockResolvedValue(mockResponse)

    render(<LoginForm />)

    // Fill in form
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'Test123!@#')
    await user.click(screen.getByRole('checkbox', { name: /remember me/i }))

    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Verify API was called
    await waitFor(() => {
      expect(vi.mocked(authApi.login)).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Test123!@#',
      })
    })

    // Verify context was updated
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(mockResponse)
    })

    // Verify redirect
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('handles error flow: invalid credentials → error banner → retry → success', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      accessToken: 'mock-jwt-token',
      tokenType: 'Bearer',
      expiresIn: 86400000,
      userId: 1,
      email: 'test@example.com',
    }

    const { authApi } = await import('@/lib/api/auth')

    // First attempt fails
    vi.mocked(authApi.login).mockRejectedValueOnce(
      new Error('Invalid credentials')
    )

    render(<LoginForm />)

    // First attempt
    await user.type(screen.getByLabelText(/email address/i), 'wrong@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'WrongPass123!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Error banner should appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i)
    })

    // Second attempt succeeds
    vi.mocked(authApi.login).mockResolvedValueOnce(mockResponse)

    await user.clear(screen.getByLabelText(/email address/i))
    await user.clear(screen.getByPlaceholderText('••••••••'))
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'Test123!@#')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Error banner should disappear
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    // Should redirect to dashboard
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
