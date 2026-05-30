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
