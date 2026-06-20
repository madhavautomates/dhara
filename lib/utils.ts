import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return `₹${price.toFixed(0)}`
}

export function calcDiscount(price: number, mrp: number | null): number | null {
  if (!mrp || mrp <= price) return null
  return Math.round(((mrp - price) / mrp) * 100)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const DELIVERY_FREE_THRESHOLD = 500
export const DELIVERY_CHARGE = 40

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const list = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return list.includes(email.toLowerCase())
}
