import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatsCard from '@/app/(dashboard)/dashboard/StatsCard'
import type { UserStats } from '@/lib/types/product'

describe('StatsCard', () => {
  const mockStats: UserStats = {
    ordersThisMonth: 5,
    totalSpent: 237.50,
    loyaltyPoints: 2450,
  }

  it('renders account stats title', () => {
    render(<StatsCard stats={mockStats} />)
    expect(screen.getByText('Account Stats')).toBeInTheDocument()
  })

  it('renders orders this month', () => {
    render(<StatsCard stats={mockStats} />)
    expect(screen.getByText('Orders this month')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders total spent with gold gradient', () => {
    render(<StatsCard stats={mockStats} />)
    expect(screen.getByText('Total spent')).toBeInTheDocument()
    expect(screen.getByText('$237.50')).toBeInTheDocument()
  })

  it('renders loyalty points', () => {
    render(<StatsCard stats={mockStats} />)
    expect(screen.getByText('Loyalty Points')).toBeInTheDocument()
    expect(screen.getByText('2,450')).toBeInTheDocument()
  })
})
