'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingBag, Bell, ChevronDown } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Header() {
  const { user } = useAuth()

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="font-display text-3xl font-bold bg-gradient-to-r from-accent via-accent-light to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            ShopHub
          </Link>

          {/* Search Bar (Hidden on mobile) */}
          <div className="hidden md:block flex-1 max-w-2xl mx-12">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for luxury items..."
                className="w-full h-12 pl-12 pr-4 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                aria-label="Search"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <button
              className="relative h-12 w-12 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
              aria-label="Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 bg-gradient-to-br from-accent to-accent-dark text-white text-xs font-bold rounded-full shadow-lg">
                2
              </span>
            </button>

            {/* Notifications */}
            <button
              className="relative h-12 w-12 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
              aria-label="Notifications"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-xl cursor-pointer transition-all">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-accent to-accent-dark shadow-lg">
                <span>{userInitial}</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-gray-900">
                  {user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-xs text-gray-500">Premium Member</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
