'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'

export default function SalesTransactionPage() {
  const [formData, setFormData] = useState({
    productId: '',
    outletId: '',
    saleDate: new Date().toISOString().split('T')[0],
    quantitySold: 1,
    unitPrice: 0,
  })

  const recordSaleMutation = trpc.sales.record.useMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await recordSaleMutation.mutateAsync(formData)
      alert('Sale recorded successfully!')
      // Reset quantity
      setFormData({
        ...formData,
        quantitySold: 1,
        unitPrice: 0,
      })
    } catch (error: any) {
      alert(error.message || 'Failed to record sale')
    }
  }

  const totalRevenue = formData.quantitySold * formData.unitPrice

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Sales Transaction</h1>
        <p className="text-gray-600">Record point-of-sale transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Input Form */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>New Sale</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                label="Product ID"
                placeholder="Enter product UUID"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                fullWidth
                required
              />

              <Input
                type="text"
                label="Outlet ID"
                placeholder="Enter outlet UUID"
                value={formData.outletId}
                onChange={(e) => setFormData({ ...formData, outletId: e.target.value })}
                fullWidth
                required
              />

              <Input
                type="date"
                label="Sale Date"
                value={formData.saleDate}
                onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                fullWidth
                required
              />

              <Input
                type="number"
                label="Quantity Sold"
                min="1"
                value={formData.quantitySold}
                onChange={(e) => setFormData({ ...formData, quantitySold: parseInt(e.target.value) || 1 })}
                fullWidth
                required
              />

              <Input
                type="number"
                label="Unit Price (Rp)"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                fullWidth
                required
              />

              {/* Total Revenue Display */}
              <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  Rp {totalRevenue.toLocaleString('id-ID')}
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={recordSaleMutation.isPending}
              >
                {recordSaleMutation.isPending ? 'Processing...' : 'Record Sale'}
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Sales Summary */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Today's Sales Summary</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">47</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Items Sold</p>
                <p className="text-2xl font-bold text-gray-900">320 units</p>
              </div>

              <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <p className="text-sm text-green-800">Total Revenue Today</p>
                <p className="text-2xl font-bold text-green-900">Rp 12,450,000</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-blue-800">Average Transaction</p>
                <p className="text-2xl font-bold text-blue-900">Rp 264,894</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card variant="default" padding="lg">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900">Transaction #{1000 + i}</p>
                  <p className="text-sm text-gray-500">Product ABC • 5 units</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">Rp 250,000</p>
                  <p className="text-xs text-gray-500">Just now</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
