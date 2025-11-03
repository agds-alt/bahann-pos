'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'

export default function InventoryMonitorPage() {
  const [selectedOutletId, setSelectedOutletId] = useState('')
  const [stockThreshold, setStockThreshold] = useState<10 | 20 | 50>(10)

  // Fetch data
  const { data: outlets } = trpc.outlets.getAll.useQuery()
  const { data: products } = trpc.products.getAll.useQuery()
  const { data: stats } = trpc.dashboard.getStats.useQuery({
    outletId: selectedOutletId || undefined,
  })
  const { data: lowStock } = trpc.dashboard.getLowStock.useQuery({
    outletId: selectedOutletId || undefined,
    threshold: stockThreshold,
  })

  const selectedOutlet = outlets?.find(o => o.id === selectedOutletId)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Inventory Monitor</h1>
        <p className="text-gray-600">Real-time stock levels across all locations</p>
      </div>

      {/* Filters */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Outlet"
              value={selectedOutletId}
              onChange={(e) => setSelectedOutletId(e.target.value)}
              options={[
                { value: '', label: 'All Outlets' },
                ...(outlets?.map(outlet => ({
                  value: outlet.id,
                  label: outlet.name,
                })) || []),
              ]}
              fullWidth
            />
            <Select
              label="Low Stock Threshold"
              value={stockThreshold.toString()}
              onChange={(e) => setStockThreshold(Number(e.target.value) as 10 | 20 | 50)}
              options={[
                { value: '10', label: '10 units or less' },
                { value: '20', label: '20 units or less' },
                { value: '50', label: '50 units or less' },
              ]}
              fullWidth
            />
          </div>
          {selectedOutlet && (
            <div className="mt-4 p-3 bg-purple-50 border-2 border-purple-200 rounded-xl">
              <p className="text-xs text-purple-600 font-semibold">Viewing Outlet:</p>
              <p className="text-sm font-semibold text-purple-900">{selectedOutlet.name}</p>
              <p className="text-xs text-purple-700">{selectedOutlet.address}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.totalProducts || products?.length || 0}
            </p>
            <p className="text-sm text-gray-600">In system</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Total Outlets</p>
            <p className="text-3xl font-bold text-gray-900">
              {selectedOutletId ? '1' : stats?.totalOutlets || outlets?.length || 0}
            </p>
            <p className="text-sm text-gray-600">Locations</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Low Stock Items</p>
            <p className="text-3xl font-bold text-red-600">
              {lowStock?.length || 0}
            </p>
            <p className="text-sm text-red-600">
              Below {stockThreshold} units
            </p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Total Items Sold</p>
            <p className="text-3xl font-bold text-green-600">
              {stats?.totalItemsSold.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-600">All time</p>
          </div>
        </Card>
      </div>

      {/* Stock Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default" padding="lg">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Healthy Stock</p>
              <p className="text-2xl font-bold text-green-600">
                {(products?.length || 0) - (lowStock?.length || 0)}
              </p>
              <p className="text-xs text-gray-500">products with adequate inventory</p>
            </div>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">
                {lowStock?.length || 0}
              </p>
              <p className="text-xs text-gray-500">products need restocking</p>
            </div>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-3xl">📦</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total SKUs</p>
              <p className="text-2xl font-bold text-blue-600">
                {products?.length || 0}
              </p>
              <p className="text-xs text-gray-500">unique product codes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStock && lowStock.length > 0 && (
        <Card variant="default" padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>⚠️ Items Requiring Immediate Attention</CardTitle>
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                {lowStock.length} items
              </span>
            </div>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Outlet</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Current Stock</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((item, index) => {
                    const severity = item.currentStock <= 5 ? 'critical' : item.currentStock <= 10 ? 'warning' : 'low'
                    const bgColor = severity === 'critical' ? 'bg-red-50' : severity === 'warning' ? 'bg-yellow-50' : 'bg-orange-50'
                    const badgeColor = severity === 'critical' ? 'bg-red-600 text-white' : severity === 'warning' ? 'bg-yellow-600 text-white' : 'bg-orange-600 text-white'

                    return (
                      <tr
                        key={`${item.productId}-${item.outletId}`}
                        className={`border-b border-gray-100 hover:opacity-80 transition-opacity ${bgColor}`}
                      >
                        <td className="py-4 px-4">
                          <p className="font-semibold text-gray-900">{item.productName}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-600 font-mono text-sm">{item.productSku}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-600">{item.productCategory || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-700 font-semibold">{item.outletName}</p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="text-2xl font-bold text-gray-900">{item.currentStock}</p>
                          <p className="text-xs text-gray-500">units</p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeColor}`}>
                            {severity === 'critical' ? '🚨 CRITICAL' : severity === 'warning' ? '⚠️ WARNING' : '⚡ LOW'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* All Products Inventory */}
      <Card variant="default" padding="lg">
        <CardHeader>
          <CardTitle>📋 All Products Inventory</CardTitle>
        </CardHeader>
        <CardBody>
          {!products || products.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <div className="text-6xl mb-4">📦</div>
              <p className="font-semibold">No products found</p>
              <p className="text-sm">Add products to start tracking inventory</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Product Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="py-4 px-4">
                        <p className="font-semibold text-gray-900">{product.name}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-600 font-mono text-sm">{product.sku}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {product.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="font-semibold text-gray-900">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(product.price || 0)}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <p className="text-sm text-blue-900 font-semibold mb-2">💡 About Inventory Monitor:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Monitor stock levels across all outlets in real-time</li>
          <li>• Set custom low stock thresholds (10, 20, or 50 units)</li>
          <li>• Track critical stock levels that need immediate attention</li>
          <li>• Filter by specific outlet to view location-specific inventory</li>
          <li>• View complete product catalog with SKU and pricing</li>
        </ul>
      </div>
    </div>
  )
}
