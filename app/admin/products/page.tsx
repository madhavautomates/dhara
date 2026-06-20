'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Edit, Trash2, Pill, Upload, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { isAdminEmail } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { CATEGORIES } from '@/types'
import type { Product } from '@/types'
import { toast } from 'sonner'

interface ProductForm {
  name: string; description: string; category: string
  price: string; mrp: string; stock: string
  requires_prescription: boolean; is_active: boolean; image_url: string
}

const emptyForm: ProductForm = {
  name: '', description: '', category: '', price: '', mrp: '', stock: '',
  requires_prescription: false, is_active: true, image_url: '',
}

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? ''
}

async function authFetch(url: string, options: RequestInit = {}) {
  const token = await getToken()
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  })
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!isAdminEmail(data.user?.email)) {
        router.push('/')
      } else {
        fetchProducts()
      }
    })
  }, [router])

  const fetchProducts = async () => {
    setLoading(true)
    const res = await authFetch('/api/admin/products')
    if (res.ok) setProducts(await res.json())
    setLoading(false)
  }

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name, description: p.description ?? '', category: p.category,
      price: String(p.price), mrp: p.mrp ? String(p.mrp) : '', stock: String(p.stock),
      requires_prescription: p.requires_prescription, is_active: p.is_active, image_url: p.image_url ?? '',
    })
    setModalOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const token = await getToken()
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error ?? 'Upload failed'); setUploading(false); return }
    setForm((f) => ({ ...f, image_url: data.url }))
    setUploading(false)
    toast.success('Image uploaded')
  }

  const handleSave = async () => {
    if (!form.name || !form.category || !form.price || !form.stock) {
      toast.error('Fill all required fields'); return
    }
    setSaving(true)
    const payload = {
      name: form.name, description: form.description || null,
      category: form.category, price: Number(form.price),
      mrp: form.mrp ? Number(form.mrp) : null, stock: Number(form.stock),
      requires_prescription: form.requires_prescription, is_active: form.is_active,
      image_url: form.image_url || null,
    }
    const url = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products'
    const method = editing ? 'PATCH' : 'POST'
    const res = await authFetch(url, { method, body: JSON.stringify(payload) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { toast.error(data.error ?? 'Failed to save'); return }
    toast.success(editing ? 'Product updated' : 'Product added')
    setModalOpen(false)
    fetchProducts()
  }

  const handleDelete = async (id: string) => {
    const res = await authFetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Delete failed'); return }
    toast.success('Product deleted')
    setProducts((ps) => ps.filter((p) => p.id !== id))
  }

  const toggleActive = async (product: Product) => {
    const res = await authFetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: !product.is_active }),
    })
    if (res.ok) {
      setProducts((ps) => ps.map((p) => p.id === product.id ? { ...p, is_active: !p.is_active } : p))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-sky-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-sm text-gray-500">{products.length} products</p>
            </div>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />Add Product
          </Button>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Product', 'Category', 'Price', 'MRP', 'Stock', 'Active', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
                            {product.image_url ? (
                              <Image src={product.image_url} alt={product.name} fill className="object-contain p-1" sizes="40px" />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Pill className="h-5 w-5 text-sky-200" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 max-w-40 truncate">{product.name}</p>
                            {product.requires_prescription && <Badge variant="destructive" className="text-[10px] px-1 py-0">Rx</Badge>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant="secondary">{product.category}</Badge></td>
                      <td className="px-4 py-3 font-semibold text-sky-600">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3 text-gray-400 line-through">{product.mrp ? formatPrice(product.mrp) : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-yellow-500' : 'text-green-600'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Switch checked={product.is_active} onCheckedChange={() => toggleActive(product)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon-sm" className="text-red-400 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete &ldquo;{product.name}&rdquo;.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(product.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="py-16 text-center text-gray-400">No products yet. Add your first product!</div>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product Image</Label>
              <div className="mt-1 flex items-center gap-3">
                <div className="relative h-16 w-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden">
                  {form.image_url ? (
                    <Image src={form.image_url} alt="preview" fill className="object-contain p-1" sizes="64px" />
                  ) : (
                    <div className="flex h-full items-center justify-center"><Pill className="h-8 w-8 text-gray-300" /></div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => fileRef.current?.click()} loading={uploading}>
                    <Upload className="h-4 w-4 mr-1" />Upload
                  </Button>
                  {form.image_url && (
                    <Button variant="ghost" size="icon-sm" onClick={() => setForm((f) => ({ ...f, image_url: '' }))}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
              <Input
                placeholder="Or paste image URL"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                className="mt-2 text-xs"
              />
            </div>
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1" placeholder="Product name" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="mt-1" rows={3} placeholder="Product description" />
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Price (₹) *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="mt-1" placeholder="0" />
              </div>
              <div>
                <Label>MRP (₹)</Label>
                <Input type="number" value={form.mrp} onChange={(e) => setForm((f) => ({ ...f, mrp: e.target.value }))} className="mt-1" placeholder="0" />
              </div>
              <div>
                <Label>Stock *</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className="mt-1" placeholder="0" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
              <div>
                <Label>Requires Prescription</Label>
                <p className="text-xs text-gray-400">Mark if Rx is needed</p>
              </div>
              <Switch checked={form.requires_prescription} onCheckedChange={(v) => setForm((f) => ({ ...f, requires_prescription: v }))} />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-gray-400">Visible in store</p>
              </div>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button className="flex-1" loading={saving} onClick={handleSave}>
                {editing ? 'Save Changes' : 'Add Product'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
