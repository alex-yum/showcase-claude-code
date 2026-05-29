import { describe, it, expect } from 'vitest'
import { API_CONFIG } from '@/lib/api/config'

describe('API_CONFIG', () => {
  it('has baseURL property', () => {
    expect(API_CONFIG).toHaveProperty('baseURL')
    expect(typeof API_CONFIG.baseURL).toBe('string')
  })

  it('has authService endpoint', () => {
    expect(API_CONFIG.authService).toBe('/api/v1/auth')
  })

  it('has timeout property', () => {
    expect(API_CONFIG.timeout).toBe(10000)
  })
})
