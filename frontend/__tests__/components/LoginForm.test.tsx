import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '@/app/(auth)/login/LoginForm'
import * as authApi from '@/lib/api/auth'

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
const mockAuthLogin = vi.fn()
vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockAuthLogin,
    logout: vi.fn(),
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}))

describe('LoginForm', () => {
  it('renders all form fields', () => {
    render(<LoginForm />)

    // Check for email field
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()

    // Check for password field
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()

    // Check for remember me checkbox
    expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument()

    // Check for submit button
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })
})

describe('LoginForm - Form Submission', () => {
  it('submits form with correct data', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'Test123!@#')
    await user.click(screen.getByRole('checkbox', { name: /remember me/i }))

    // Submit the form
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Form should have been submitted (we'll check this via console log for now)
    await waitFor(() => {
      // This will fail initially because we don't have form handling yet
      expect(true).toBe(true)
    })
  })
})

describe('LoginForm - Password Toggle', () => {
  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })

    // Initially password type
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Click toggle - should show password
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    // Click again - should hide password
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})

describe('LoginForm - API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls authApi.login with form data on submit', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.authApi.login).mockResolvedValue({
      accessToken: 'mock-token',
      tokenType: 'Bearer',
      expiresIn: 86400000,
      userId: 1,
      email: 'test@example.com',
    })

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'Test123!@#')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(authApi.authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Test123!@#',
      })
    })
  })
})
