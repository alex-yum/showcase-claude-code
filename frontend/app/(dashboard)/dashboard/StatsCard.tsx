'use client'

import React from 'react'
import { ShoppingBag, DollarSign, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { UserStats } from '@/lib/types/product'

interface StatsCardProps {
  stats: UserStats
}

export default function StatsCard({ stats }: StatsCardProps) {
  return (
    <Card className="bg-white rounded-2xl shadow-lg border-gray-100">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-gray-900">Account Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg">
            <ShoppingBag className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Orders this month</p>
            <p className="font-display text-3xl font-bold text-gray-900">{stats.ordersThisMonth}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 shadow-lg">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total spent</p>
            <p className="font-display text-3xl font-bold bg-gradient-to-r from-accent to-accent-dark bg-clip-text text-transparent">
              ${stats.totalSpent.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 shadow-lg">
            <Star className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Loyalty Points</p>
            <p className="font-display text-3xl font-bold text-gray-900">
              {stats.loyaltyPoints.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
