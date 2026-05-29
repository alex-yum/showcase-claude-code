import React from 'react'
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
