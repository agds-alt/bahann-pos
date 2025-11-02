'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'

export default function StockManagementPage() {
  const [formData, setFormData] = useState({
    productId: '',
    outletId: '',
    stockDate: new Date().toISOString().split('T')[0],
    stockAwal: 0,
    stockIn: 0,
    stockOut: 0,
    stockAkhir: 0,
  })

  const recordStockMutation = trpc.stock.record.useMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await recordStockMutation.mutateAsync(formData)
      alert('Stock recorded successfully!')
      // Reset form
      setFormData({
        ...formData,
        stockAwal: 0,
        stockIn: 0,
        stockOut: 0,
        stockAkhir: 0,
      })
    } catch (error: any) {
      alert(error.message || 'Failed to record stock')
    }
  }

  const calculateStockAkhir = () => {
    const akhir = formData.stockAwal + formData.stockIn - formData.stockOut
    setFormData({ ...formData, stockAkhir: akhir })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Stock Management</h1>
        <p className="text-gray-600">Record daily stock movements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Input Form */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Record Stock Movement</CardTitle>
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
                label="Stock Date"
                value={formData.stockDate}
                onChange={(e) => setFormData({ ...formData, stockDate: e.target.value })}
                fullWidth
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Stock Awal"
                  value={formData.stockAwal}
                  onChange={(e) => setFormData({ ...formData, stockAwal: parseInt(e.target.value) || 0 })}
                  fullWidth
                  required
                />

                <Input
                  type="number"
                  label="Stock In"
                  value={formData.stockIn}
                  onChange={(e) => setFormData({ ...formData, stockIn: parseInt(e.target.value) || 0 })}
                  fullWidth
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Stock Out"
                  value={formData.stockOut}
                  onChange={(e) => setFormData({ ...formData, stockOut: parseInt(e.target.value) || 0 })}
                  fullWidth
                  required
                />

                <Input
                  type="number"
                  label="Stock Akhir"
                  value={formData.stockAkhir}
                  onChange={(e) => setFormData({ ...formData, stockAkhir: parseInt(e.target.value) || 0 })}
                  fullWidth
                  required
                />
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={calculateStockAkhir}
                fullWidth
              >
                Calculate Stock Akhir
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={recordStockMutation.isPending}
              >
                {recordStockMutation.isPending ? 'Recording...' : 'Record Stock'}
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Stock Summary */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Today's Stock Summary</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Total Products Tracked</p>
                <p className="text-2xl font-bold text-gray-900">125</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Stock In Today</p>
                <p className="text-2xl font-bold text-green-600">+450 units</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Stock Out Today</p>
                <p className="text-2xl font-bold text-red-600">-320 units</p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <p className="text-sm text-yellow-800 font-semibold">⚠️ Low Stock Alert</p>
                <p className="text-lg font-bold text-yellow-900">23 items</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
