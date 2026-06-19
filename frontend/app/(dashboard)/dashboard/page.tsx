'use client'

import React, { useEffect, useState } from 'react'
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute'
import { useAuth } from '@/lib/hooks/useAuth'
import { useMSW } from '@/app/msw-provider'
import OrderCard from './OrderCard'
import QuickActions from './QuickActions'
import StatsCard from './StatsCard'
import ProductCard from './ProductCard'
import type { Order } from '@/lib/types/order'
import type { Product, UserStats } from '@/lib/types/product'

export default function DashboardPage() {
  useProtectedRoute()

  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { mswReady } = useMSW()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Don't fetch if not authenticated, still loading auth, or MSW not ready
    if (!isAuthenticated || authLoading || !mswReady) {
      return
    }

    async function fetchDashboardData() {
      try {
        setError(null)
        const token = localStorage.getItem('token')

        // Guard against null token
        if (!token) {
          setError('Authentication required')
          setLoading(false)
          return
        }

        const [ordersRes, productsRes, statsRes] = await Promise.all([
          fetch('/api/v1/orders', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/v1/products/recommendations', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/v1/users/stats', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        // Check HTTP status before parsing
        if (!ordersRes.ok || !productsRes.ok || !statsRes.ok) {
          throw new Error('Failed to fetch dashboard data. Please try again.')
        }

        const ordersData = await ordersRes.json()
        const productsData = await productsRes.json()
        const statsData = await statsRes.json()

        setOrders(ordersData.orders || [])
        setProducts(productsData.products || [])
        // Validate stats shape before setting
        if (statsData && typeof statsData.ordersThisMonth === 'number') {
          setStats(statsData)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAuthenticated, authLoading, mswReady])

  if (loading || authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-semibold mb-2">Error Loading Dashboard</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const userName = user?.email?.split('@')[0] || 'there'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome Section */}
      <div className="mb-12 animate-fade-in-up">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-5xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Welcome back, {userName}
            </h1>
            <p className="text-lg text-gray-600">Your personalized luxury shopping experience</p>
          </div>
          <div className="hidden lg:block">
            <div className="text-right">
              <div className="text-sm text-gray-500">Member since</div>
              <div className="font-display text-2xl font-bold text-gray-900">Jan 2026</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <QuickActions />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Recent Orders */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl font-bold text-gray-900">Recent Orders</h2>
              <a
                href="/orders"
                className="text-sm font-bold text-gray-700 hover:text-accent transition-colors flex items-center gap-2"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="space-y-6">
              {orders.map((order) => (
                <OrderCard key={order.orderId} order={order} />
              ))}
            </div>
          </section>

          {/* Recommended Products */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl font-bold text-gray-900">Curated for You</h2>
              <a
                href="/products"
                className="text-sm font-bold text-gray-700 hover:text-accent transition-colors flex items-center gap-2"
              >
                Browse More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="grid sm:grid-cols-2 gap-8">
              {products.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {stats && <StatsCard stats={stats} />}
        </aside>
      </div>
    </div>
  )
}
