export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  productId: number
  name: string
  quantity: number
  price: number
}

export interface Order {
  orderId: string
  userId: number
  status: OrderStatus
  items: OrderItem[]
  total: number
  createdAt: string
  updatedAt: string
}

export interface OrderSummary {
  orderId: string
  status: OrderStatus
  itemCount: number
  total: number
  createdAt: string
}
