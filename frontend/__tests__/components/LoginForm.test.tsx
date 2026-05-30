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
const mockSetSession = vi.fn()
vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    setSession: mockSetSession,
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
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits form with correct data', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.authApi.login).mockResolvedValue({
      accessToken: 'mock-token',
      tokenType: 'Bearer',
      expiresIn: 86400000,
      userId: 1,
      email: 'test@example.com',
    })

    render(<LoginForm />)

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'Test123!@#')
    await user.click(screen.getByRole('checkbox', { name: /remember me/i }))

    // Submit the form
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Verify API was called and session was set
    await waitFor(() => {
      expect(authApi.authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Test123!@#',
      })
      expect(mockSetSession).toHaveBeenCalledWith({
        accessToken: 'mock-token',
        tokenType: 'Bearer',
        expiresIn: 86400000,
        userId: 1,
        email: 'test@example.com',
      })
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

describe('LoginForm - Validation Errors', () => {
  it('shows email validation error on blur with invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email address/i)

    await user.type(emailInput, 'invalid-email')
    await user.tab() // Blur

    await waitFor(() => {
      expect(screen.getByText(/valid email required/i)).toBeInTheDocument()
    })
  })

  it('shows password validation error on blur with weak password', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    // Get password input by ID to avoid matching the label or button
    const passwordInput = document.getElementById('password') as HTMLInputElement

    await user.type(passwordInput, 'weak')
    await user.tab() // Blur

    await waitFor(() => {
      expect(screen.getByText(/minimum 8 characters/i)).toBeInTheDocument()
    })
  })

  it('clears validation errors when input becomes valid', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email address/i)

    // Enter invalid email
    await user.type(emailInput, 'invalid')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/valid email required/i)).toBeInTheDocument()
    })

    // Fix the email
    await user.clear(emailInput)
    await user.type(emailInput, 'valid@example.com')
    await user.tab()

    await waitFor(() => {
      expect(screen.queryByText(/valid email required/i)).not.toBeInTheDocument()
    })
  })
})

describe('LoginForm - 401 Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays 401 error banner for invalid credentials', async () => {
    const user = userEvent.setup()
    // Create ApiError with correct shape
    class ApiError extends Error {
      constructor(public status: number, public data: any, message?: string) {
        super(message || 'API Error')
        this.name = 'ApiError'
      }
    }
    const error = new ApiError(401, { message: 'Invalid credentials' }, 'Invalid credentials')
    vi.mocked(authApi.authApi.login).mockRejectedValue(error)

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'WrongPassword123!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
    })
  })

  it('clears error banner on retry', async () => {
    const user = userEvent.setup()
    // Create ApiError with correct shape
    class ApiError extends Error {
      constructor(public status: number, public data: any, message?: string) {
        super(message || 'API Error')
        this.name = 'ApiError'
      }
    }
    const error = new ApiError(401, { message: 'Invalid credentials' }, 'Invalid credentials')
    vi.mocked(authApi.authApi.login)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({
        accessToken: 'mock-token',
        tokenType: 'Bearer',
        expiresIn: 86400000,
        userId: 1,
        email: 'test@example.com',
      })

    render(<LoginForm />)

    // First attempt - fails with error
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'WrongPassword123!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    // Clear form and retry
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement

    await user.clear(emailInput)
    await user.clear(passwordInput)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'Test123!@#')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
