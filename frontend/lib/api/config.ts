export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  authService: '/api/v1/auth',
  timeout: 10000,
} as const
