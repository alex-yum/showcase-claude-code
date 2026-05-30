'use client'

import React from 'react'
import { ShoppingBag, Package, Heart, Gift } from 'lucide-react'

const ACTIONS = [
  { icon: ShoppingBag, label: 'Shop Now', gradient: 'from-yellow-400 to-yellow-600', rotate: '-rotate-6', delay: '0.1s' },
  { icon: Package, label: 'Track Orders', gradient: 'from-blue-400 to-blue-600', rotate: 'rotate-6', delay: '0.2s' },
  { icon: Heart, label: 'Wishlist', gradient: 'from-purple-400 to-purple-600', rotate: '-rotate-6', delay: '0.3s' },
  { icon: Gift, label: 'Sale Items', gradient: 'from-pink-400 to-pink-600', rotate: 'rotate-6', delay: '0.4s' },
]

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          className="h-28 px-6 bg-white rounded-2xl flex flex-col items-center justify-center gap-3 border-2 border-transparent hover:border-accent hover:-translate-y-1 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-accent/20 animate-scale-in"
          style={{ animationDelay: action.delay }}
        >
          <div
            className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center transform ${action.rotate} shadow-lg`}
          >
            <action.icon className="w-7 h-7 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-800">{action.label}</span>
        </button>
      ))}
    </div>
  )
}
