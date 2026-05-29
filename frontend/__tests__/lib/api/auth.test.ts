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

    expect(response.accessToken).toBe('mock-jwt-token-12345')
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
    const response = await authApi.validate('mock-jwt-token-12345')
    expect(response.valid).toBe(true)
    expect(response.userId).toBe(1)
  })
})
