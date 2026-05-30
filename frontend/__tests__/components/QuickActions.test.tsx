import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import QuickActions from '@/app/(dashboard)/dashboard/QuickActions'

describe('QuickActions', () => {
  it('renders all 4 action buttons', () => {
    render(<QuickActions />)
    expect(screen.getByRole('button', { name: /shop now/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /track orders/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /wishlist/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sale items/i })).toBeInTheDocument()
  })

  it('renders with staggered animation classes', () => {
    const { container } = render(<QuickActions />)
    const buttons = container.querySelectorAll('button')
    expect(buttons[0]).toHaveClass('animate-scale-in')
    expect(buttons[1]).toHaveClass('animate-scale-in')
    expect(buttons[2]).toHaveClass('animate-scale-in')
    expect(buttons[3]).toHaveClass('animate-scale-in')
  })
})
