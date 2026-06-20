export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  mrp: number | null
  category: string
  image_url: string | null
  stock: number
  requires_prescription: boolean
  is_active: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string | null
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: string
  city: string
  pincode: string
  total_amount: number
  delivery_charge: number
  status: OrderStatus
  payment_method: string
  notes: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  price: number
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}

export interface CartItem {
  product: Product
  quantity: number
}

export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled'

export const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled']

export const CATEGORIES = [
  'Medicines',
  'Vitamins',
  'Skincare',
  'Baby Care',
  'Surgical',
  'Personal Care',
] as const

export type Category = typeof CATEGORIES[number]
