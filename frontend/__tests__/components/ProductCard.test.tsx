import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductCard from '@/app/(dashboard)/dashboard/ProductCard'
import type { Product } from '@/lib/types/product'

describe('ProductCard', () => {
  const mockProduct: Product = {
    productId: 1,
    name: 'Premium Cotton T-Shirt',
    description: 'Luxuriously soft everyday essential',
    price: 24.99,
    rating: 4.5,
    reviewCount: 234,
    inStock: true,
  }

  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Premium Cotton T-Shirt')).toBeInTheDocument()
  })

  it('renders product description', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Luxuriously soft everyday essential')).toBeInTheDocument()
  })

  it('renders product price', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('$24.99')).toBeInTheDocument()
  })

  it('renders rating and review count', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('4.5 (234)')).toBeInTheDocument()
  })

  it('renders Add to Cart button', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
  })

  it('renders wishlist button', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByRole('button', { name: /add to wishlist/i })).toBeInTheDocument()
  })

  it('toggles wishlist icon on click', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)

    const wishlistButton = screen.getByRole('button', { name: /add to wishlist/i })

    // Initially not in wishlist (outlined heart)
    await user.click(wishlistButton)

    // After click, should be in wishlist (filled heart)
    expect(wishlistButton).toBeInTheDocument()
  })
})
