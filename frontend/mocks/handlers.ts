import { http, HttpResponse } from 'msw'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''

export const handlers = [
  // Auth: Login
  http.post(`${API_BASE}/api/v1/auth/login`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    const email = body.email as string
    const password = body.password as string

    if (email === 'test@example.com' && password === 'Test123!@#') {
      return HttpResponse.json({
        accessToken: 'mock-jwt-token-12345',
        tokenType: 'Bearer',
        expiresIn: 86400000,
        userId: 1,
        email: 'test@example.com',
      })
    }

    if (email === 'locked@example.com' && password === 'Test123!@#') {
      return HttpResponse.json(
        {
          status: 423,
          error: 'Locked',
          message: 'Account is temporarily locked due to too many login attempts',
          lockoutTimeRemaining: 900000,
        },
        { status: 423 }
      )
    }

    return HttpResponse.json(
      {
        status: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
      },
      { status: 401 }
    )
  }),

  // Auth: Logout
  http.post(`${API_BASE}/api/v1/auth/logout`, () => {
    return HttpResponse.json({
      message: 'Logged out successfully',
    })
  }),

  // Auth: Validate
  http.get(`${API_BASE}/api/v1/auth/validate`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (authHeader?.startsWith('Bearer mock-jwt-token')) {
      return HttpResponse.json({
        valid: true,
        userId: 1,
        email: 'test@example.com',
      })
    }

    return HttpResponse.json(
      {
        valid: false,
        error: 'Invalid or expired token',
      },
      { status: 401 }
    )
  }),
]
