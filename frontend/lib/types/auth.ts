export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  userId: number
  email: string
}

export interface ValidateResponse {
  valid: boolean
  userId: number
  email: string
}

export interface User {
  userId: number
  email: string
}

export interface AuthError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  // Optional fields for specific errors
  email?: string
  lockoutTimeRemaining?: number
}
