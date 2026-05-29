import { describe, it, expect } from 'vitest'
import { loginSchema } from '@/lib/utils/validators'

describe('loginSchema', () => {
  it('validates correct login data', () => {
    const data = {
      email: 'test@example.com',
      password: 'Test123!@#',
      rememberMe: true,
    }

    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const data = {
      email: 'not-an-email',
      password: 'Test123!@#',
    }

    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('rejects password without uppercase', () => {
    const data = {
      email: 'test@example.com',
      password: 'test123!@#',
    }

    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects password without lowercase', () => {
    const data = {
      email: 'test@example.com',
      password: 'TEST123!@#',
    }

    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects password without digit', () => {
    const data = {
      email: 'test@example.com',
      password: 'TestABC!@#',
    }

    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects password without special character', () => {
    const data = {
      email: 'test@example.com',
      password: 'Test123456',
    }

    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 8 characters', () => {
    const data = {
      email: 'test@example.com',
      password: 'Te12!@',
    }

    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})
