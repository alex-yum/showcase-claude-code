'use client'

import React, { useState } from 'react'

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // TODO: Handle login
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-white">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-lg bg-surface/40 border border-accent/20 text-white placeholder-gray-500 focus:outline-none focus:border-accent/60 transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-white">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-lg bg-surface/40 border border-accent/20 text-white placeholder-gray-500 focus:outline-none focus:border-accent/60 transition-colors"
        />
      </div>

      <div className="flex items-center">
        <input
          id="rememberMe"
          name="rememberMe"
          type="checkbox"
          checked={formData.rememberMe}
          onChange={handleChange}
          className="w-4 h-4 rounded border-accent/20 text-accent focus:ring-accent cursor-pointer"
        />
        <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-300 cursor-pointer">
          Remember Me
        </label>
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 rounded-lg bg-accent hover:bg-accent/90 text-white font-semibold transition-colors"
      >
        Sign In
      </button>
    </form>
  )
}
