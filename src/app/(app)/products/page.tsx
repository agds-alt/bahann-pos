'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const { data: products, isLoading, refetch } = trpc.products.getAll.useQuery({
    search: searchTerm || undefined,
    category: categoryFilter || undefined,
  })

  const { data: categories } = trpc.products.getCategories.useQuery()

  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct.mutateAsync({ id })
        alert('Product deleted successfully!')
      } catch (error: any) {
        alert(error.message || 'Failed to delete product')
      }
    }
  }

  const handleAddNew = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🏷️ Products Management</h1>
        <p className="text-gray-600">Manage your product catalog</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="default" padding="lg">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">
              {products?.length || 0}
            </p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Categories</p>
            <p className="text-3xl font-bold text-blue-600">
              {categories?.length || 0}
            </p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">With Price</p>
            <p className="text-3xl font-bold text-green-600">
              {products?.filter((p) => p.price).length || 0}
            </p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Without Price</p>
            <p className="text-3xl font-bold text-yellow-600">
              {products?.filter((p) => !p.price).length || 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card variant="elevated" padding="lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
          </div>

          <div className="w-full md:w-64">
            <Select
              value={categoryFilter}
              onChange={(e: any) => setCategoryFilter(e.target.value)}
              options={[
                { value: '', label: 'All Categories' },
                ...(categories || []).map((cat) => ({ value: cat, label: cat })),
              ]}
              fullWidth
            />
          </div>

          <Button variant="primary" size="md" onClick={handleAddNew}>
            ➕ Add Product
          </Button>
        </div>
      </Card>

      {/* Products Table */}
      <Card variant="default" padding="lg">
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : !products || products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || categoryFilter
                  ? 'No products match your filters. Try adjusting your search.'
                  : 'Start by adding your first product.'}
              </p>
              {!searchTerm && !categoryFilter && (
                <Button variant="primary" onClick={handleAddNew}>
                  Add First Product
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`
                        border-b border-gray-100 hover:bg-gray-50 transition-colors
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      `}
                    >
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm text-gray-900">{product.sku}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-900">{product.name}</span>
                      </td>
                      <td className="py-4 px-4">
                        {product.category ? (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No category</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(product.price)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="px-3 py-1 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="px-3 py-1 text-sm font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            disabled={deleteProduct.isPending}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Product Form Modal */}
      {isModalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setIsModalOpen(false)
            setEditingProduct(null)
          }}
          onSuccess={() => {
            refetch()
            setIsModalOpen(false)
            setEditingProduct(null)
          }}
        />
      )}
    </div>
  )
}

/**
 * Product Form Modal Component
 */
interface ProductFormModalProps {
  product: any | null
  onClose: () => void
  onSuccess: () => void
}

function ProductFormModal({ product, onClose, onSuccess }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    sku: product?.sku || '',
    name: product?.name || '',
    category: product?.category || '',
    price: product?.price || '',
  })

  const createProduct = trpc.products.create.useMutation()
  const updateProduct = trpc.products.update.useMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const data = {
        sku: formData.sku,
        name: formData.name,
        category: formData.category || undefined,
        price: formData.price ? parseFloat(formData.price.toString()) : undefined,
      }

      if (product) {
        // Update existing product
        await updateProduct.mutateAsync({
          id: product.id,
          ...data,
        })
        alert('Product updated successfully!')
      } else {
        // Create new product
        await createProduct.mutateAsync(data)
        alert('Product created successfully!')
      }

      onSuccess()
    } catch (error: any) {
      alert(error.message || 'Operation failed')
    }
  }

  const isLoading = createProduct.isPending || updateProduct.isPending

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card variant="elevated" padding="lg" className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{product ? 'Edit Product' : 'Add New Product'}</CardTitle>
            <button
              onClick={onClose}
              className="text-2xl text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="SKU *"
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g., PROD-001"
              fullWidth
              required
            />

            <Input
              label="Product Name *"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Coca Cola 330ml"
              fullWidth
              required
            />

            <Input
              label="Category"
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Beverages"
              fullWidth
            />

            <Input
              label="Price (Rp)"
              type="number"
              step="1"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g., 5000"
              fullWidth
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                fullWidth
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
