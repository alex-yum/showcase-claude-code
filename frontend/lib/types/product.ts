export interface Product {
  productId: number
  name: string
  description: string
  price: number
  rating: number
  reviewCount: number
  imageUrl?: string
  inStock: boolean
}

export interface UserStats {
  ordersThisMonth: number
  totalSpent: number
  loyaltyPoints: number
}

export interface Notification {
  id: string
  type: 'order' | 'promo' | 'recommendation' | 'restock'
  message: string
  createdAt: string
  read: boolean
}
