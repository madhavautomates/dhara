'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, User, Phone, Mail, FileText, Banknote, ShoppingBag, Pill } from 'lucide-react'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import EmailOTPAuth from '@/components/EmailOTPModal'
import { formatPrice, DELIVERY_CHARGE, DELIVERY_FREE_THRESHOLD } from '@/lib/utils'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface CheckoutForm {
  name: string
  email: string
  phone: string
  address: string
  city: string
  pincode: string
  notes: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [form, setForm] = useState<CheckoutForm>({
    name: '', email: '', phone: '', address: '', city: 'Kasrawad', pincode: '451551', notes: '',
  })

  const subtotal = total()
  const delivery = subtotal > 0 && subtotal < DELIVERY_FREE_THRESHOLD ? DELIVERY_CHARGE : 0
  const grandTotal = subtotal + delivery

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      setUser(u)
      if (u?.email) setForm((f) => ({ ...f, email: u.email! }))
      setAuthLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u?.email) setForm((f) => ({ ...f, email: u.email! }))
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const handleAuthSuccess = () => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      setUser(u)
      if (u?.email) setForm((f) => ({ ...f, email: u.email! }))
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handlePlaceOrder = async () => {
    if (!user) { toast.error('Please login first'); return }
    if (!form.name || !form.phone || !form.address || !form.pincode) {
      toast.error('Please fill all required fields')
      return
    }
    if (items.length === 0) { toast.error('Your cart is empty'); return }

    setPlacing(true)
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          delivery_address: form.address,
          city: form.city,
          pincode: form.pincode,
          total_amount: grandTotal,
          delivery_charge: delivery,
          status: 'pending',
          payment_method: 'COD',
          notes: form.notes || null,
        })
        .select()
        .single()

      if (error || !order) throw error ?? new Error('Order creation failed')

      const orderItems = items.map((i) => ({
        order_id: order.id,
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      clearCart()
      router.push(`/order-success/${order.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0 && !placing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <Button onClick={() => router.push('/products')}>Browse Products</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Auth + Form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Auth */}
            {!authLoading && !user && (
              <EmailOTPAuth onSuccess={handleAuthSuccess} />
            )}

            {/* Delivery Form */}
            {!authLoading && user && (
              <div className="rounded-2xl bg-white border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-sky-500" />
                  Delivery Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input id="name" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} className="pl-9" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input id="email" name="email" type="email" placeholder="email@example.com" value={form.email} onChange={handleChange} className="pl-9" readOnly />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} className="pl-9" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">Full Address *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="House/Flat No., Street, Area, Landmark"
                      value={form.address}
                      onChange={handleChange}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={form.city} onChange={handleChange} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input id="pincode" name="pincode" placeholder="452001" maxLength={6} value={form.pincode} onChange={handleChange} className="mt-1" />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">Order Notes (optional)</Label>
                    <div className="relative mt-1">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea id="notes" name="notes" placeholder="Any specific instructions..." value={form.notes} onChange={handleChange} className="pl-9" rows={2} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="rounded-2xl bg-white border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Banknote className="h-5 w-5 text-sky-500" />
                Payment Method
              </h2>
              <div className="flex items-center gap-3 rounded-xl border-2 border-sky-500 bg-sky-50 p-4">
                <div className="h-4 w-4 rounded-full border-4 border-sky-500 bg-white" />
                <div>
                  <p className="font-semibold text-gray-900">Cash on Delivery (COD)</p>
                  <p className="text-xs text-gray-500">Pay cash when order arrives at your door</p>
                </div>
                <Banknote className="h-8 w-8 text-sky-400 ml-auto" />
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3 items-center">
                    <div className="relative h-10 w-10 shrink-0 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.name} fill className="object-contain p-1" sizes="40px" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Pill className="h-5 w-5 text-sky-200" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-400">Qty: {quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-sky-600 shrink-0">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="mb-3" />
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={delivery === 0 ? 'text-green-600 font-medium' : ''}>
                    {delivery === 0 ? 'FREE' : formatPrice(delivery)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span className="text-sky-600">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {user ? (
                <Button className="w-full" size="lg" loading={placing} onClick={handlePlaceOrder}>
                  Place Order — {formatPrice(grandTotal)}
                </Button>
              ) : (
                <Button className="w-full" size="lg" disabled>
                  Login to Place Order
                </Button>
              )}
              <p className="text-xs text-gray-400 text-center mt-2">
                By placing order you agree to our terms of service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
