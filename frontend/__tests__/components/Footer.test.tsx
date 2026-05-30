import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '@/components/shared/Footer'

describe('Footer', () => {
  it('renders copyright text', () => {
    render(<Footer />)
    expect(screen.getByText(/© 2026 ShopHub/i)).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: /about us/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /help center/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contact us/i })).toBeInTheDocument()
  })
})
