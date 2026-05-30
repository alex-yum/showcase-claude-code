'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { loginSchema } from '@/lib/utils/validators'
import type { LoginRequest } from '@/lib/types/auth'

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest & { rememberMe: boolean }>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginRequest & { rememberMe: boolean }) => {
    console.log('Form submitted:', data)
    // TODO: Call authApi.login() in next task
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
