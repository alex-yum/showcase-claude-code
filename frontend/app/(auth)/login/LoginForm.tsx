'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { loginSchema } from '@/lib/utils/validators'
import { authApi } from '@/lib/api/auth'
import { useAuth } from '@/lib/hooks/useAuth'
import type { LoginRequest } from '@/lib/types/auth'

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login: authLogin } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest & { rememberMe: boolean }>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginRequest & { rememberMe: boolean }) => {
    try {
      setApiError(null)

      // Call auth API
      const response = await authApi.login({
        email: data.email,
        password: data.password,
      })

      // Update auth context
      await authLogin(response)

      // Redirect to returnTo URL or dashboard
      const returnTo = searchParams.get('returnTo') || '/dashboard'
      router.push(returnTo)
    } catch (error: any) {
      setApiError(error.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="bg-surface/40 backdrop-blur-xl border border-accent/10 rounded-2xl p-8 shadow-2xl">
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold text-white mb-2">
          Sign In
        </h2>
        <p className="font-body text-sm text-gray-400">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* API Error Banner */}
        {apiError && (
          <div
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
            role="alert"
          >
            <p className="font-body text-sm text-red-400">{apiError}</p>
          </div>
        )}

        {/* Email field */}
        <div>
          <label htmlFor="email" className="block font-body text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className="w-full px-4 py-3 rounded-lg bg-surface/40 border border-accent/20 text-white placeholder-gray-500 focus:outline-none focus:border-accent/60 transition-colors"
            placeholder="you@example.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 font-body text-sm text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password field */}
        <div>
          <label htmlFor="password" className="block font-body text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              {...register('password')}
              className="w-full px-4 py-3 pr-12 rounded-lg bg-surface/40 border border-accent/20 text-white placeholder-gray-500 focus:outline-none focus:border-accent/60 transition-colors"
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              aria-label="Toggle password visibility"
              disabled={isSubmitting}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 font-body text-sm text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember me checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            {...register('rememberMe')}
            className="w-4 h-4 rounded border-accent/20 text-accent focus:ring-accent cursor-pointer"
            disabled={isSubmitting}
          />
          <label htmlFor="rememberMe" className="ml-2 font-body text-sm text-gray-300 cursor-pointer">
            Remember me
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-lg bg-accent hover:bg-accent/90 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
