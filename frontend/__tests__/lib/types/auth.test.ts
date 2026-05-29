import { describe, it, expect } from 'vitest'
import type { LoginRequest, LoginResponse, User, AuthError } from '@/lib/types/auth'

describe('Auth Types', () => {
  it('LoginRequest type accepts valid shape', () => {
    const request: LoginRequest = {
      email: 'test@example.com',
      password: 'Test123!@#',
      rememberMe: true,
    }
    expect(request.email).toBe('test@example.com')
  })

  it('LoginResponse type accepts valid shape', () => {
    const response: LoginResponse = {
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 86400000,
      userId: 1,
      email: 'test@example.com',
    }
    expect(response.accessToken).toBe('token')
  })

  it('User type accepts valid shape', () => {
    const user: User = {
      userId: 1,
      email: 'test@example.com',
    }
    expect(user.userId).toBe(1)
  })

  it('AuthError type accepts valid shape', () => {
    const error: AuthError = {
      timestamp: '2026-05-29T00:00:00Z',
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid credentials',
      path: '/api/v1/auth/login',
    }
    expect(error.status).toBe(401)
  })
})
