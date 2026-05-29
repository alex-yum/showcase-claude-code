import { apiClient } from './client'
import { API_CONFIG } from './config'
import type { LoginRequest, LoginResponse, ValidateResponse } from '@/lib/types/auth'

export const authApi = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(
      `${API_CONFIG.authService}/login`,
      request
    )
  },

  async logout(): Promise<{ message: string }> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return apiClient.post<{ message: string }>(
      `${API_CONFIG.authService}/logout`,
      undefined,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    )
  },

  async validate(token: string): Promise<ValidateResponse> {
    return apiClient.get<ValidateResponse>(
      `${API_CONFIG.authService}/validate`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
  },
}
