import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ApiClient } from '@/lib/api/client'

describe('ApiClient', () => {
  let client: ApiClient

  beforeEach(() => {
    client = new ApiClient()
  })

  it('creates instance with default baseURL', () => {
    expect(client).toBeInstanceOf(ApiClient)
  })

  it('makes GET request', async () => {
    const result = await client.get<{ valid: boolean }>('/api/v1/auth/validate', {
      headers: { Authorization: 'Bearer mock-jwt-token-12345' },
    })
    expect(result).toHaveProperty('valid')
  })

  it('makes POST request with body', async () => {
    const result = await client.post('/api/v1/auth/login', {
      email: 'test@example.com',
      password: 'Test123!@#',
    })
    expect(result).toHaveProperty('accessToken')
  })

  it('throws error on 401', async () => {
    await expect(
      client.post('/api/v1/auth/login', {
        email: 'wrong@example.com',
        password: 'wrong',
      })
    ).rejects.toThrow()
  })
})
