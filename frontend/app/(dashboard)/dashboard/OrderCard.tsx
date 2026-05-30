'use client'

import React from 'react'
import { Truck, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Order } from '@/lib/types/order'

interface OrderCardProps {
  order: Order
}

const STATUS_CONFIG = {
  shipped: {
    label: 'Shipped',
    icon: Truck,
    gradient: 'from-purple-400 to-purple-600',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    gradient: 'from-green-400 to-green-600',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    gradient: 'from-amber-400 to-amber-600',
  },
  cancelled: {
    label: 'Cancelled',
    icon: Clock,
    gradient: 'from-red-400 to-red-600',
  },
}

export default function OrderCard({ order }: OrderCardProps) {
  const statusConfig = STATUS_CONFIG[order.status]
  const StatusIcon = statusConfig.icon

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Card className="transition-all duration-300 hover:shadow-xl hover:border-accent/30 hover:-translate-y-1 bg-white border-gray-100 rounded-2xl">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-display text-xl font-bold text-gray-900 mb-1">
              Order #{order.orderId}
            </h3>
            <p className="text-sm text-gray-500">Placed on {formattedDate}</p>
          </div>
          <Badge
            className={`bg-gradient-to-br ${statusConfig.gradient} text-white border-0 px-4 py-2 gap-2`}
          >
            <StatusIcon className="w-4 h-4" />
            {statusConfig.label}
          </Badge>
        </div>

        <div className="flex items-center gap-6 pb-6 mb-6 border-b border-gray-100">
          <div>
            <p className="text-sm text-gray-600 mb-1">Items</p>
            <p className="text-lg font-bold text-gray-900">{order.items.length}</p>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="font-display text-3xl font-bold bg-gradient-to-r from-accent to-accent-dark bg-clip-text text-transparent">
              ${order.total.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          {order.status === 'shipped' && (
            <>
              <Button className="flex-1 bg-gradient-to-r from-accent to-accent-dark hover:opacity-90 shadow-lg">
                Track Order
              </Button>
              <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                Details
              </Button>
            </>
          )}
          {order.status === 'delivered' && (
            <>
              <Button variant="outline" className="flex-1 border-gray-200 hover:bg-gray-50">
                Buy Again
              </Button>
              <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                Details
              </Button>
            </>
          )}
          {order.status === 'pending' && (
            <>
              <Button className="flex-1 bg-gradient-to-r from-accent to-accent-dark hover:opacity-90 shadow-lg">
                Complete Payment
              </Button>
              <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
