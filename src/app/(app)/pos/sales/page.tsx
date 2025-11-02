'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { PrintPreviewModal } from '@/components/print/PrintPreviewModal'
import { ReceiptData } from '@/components/print/PrintReceipt'

export default function SalesTransactionPage() {
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    productSku: '',
    outletId: '',
    saleDate: new Date().toISOString().split('T')[0],
    quantitySold: 1,
    unitPrice: 0,
  })

  const [paymentData, setPaymentData] = useState({
    method: 'cash',
    amountPaid: 0,
  })

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)

  const recordSaleMutation = trpc.sales.record.useMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await recordSaleMutation.mutateAsync({
        productId: formData.productId,
        outletId: formData.outletId,
        saleDate: formData.saleDate,
        quantitySold: formData.quantitySold,
        unitPrice: formData.unitPrice,
      })

      // Generate receipt data
      const total = formData.quantitySold * formData.unitPrice
      const change = paymentData.amountPaid - total
      const transactionId = generateTransactionId()
      const now = new Date()

      const receipt: ReceiptData = {
        transactionId,
        date: now.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        time: now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        cashier: getUserName(), // Get from session/context
        outlet: {
          name: 'OTISTA Outlet', // Get from outlet data
          address: 'Jl. Otista Raya No. 123, Jakarta Timur',
          phone: '+62 21 8765 4321',
          email: 'otista@bahann.com',
        },
        items: [
          {
            name: formData.productName || 'Product Name',
            sku: formData.productSku || 'SKU-000',
            quantity: formData.quantitySold,
            unitPrice: formData.unitPrice,
            total: total,
          },
        ],
        subtotal: total,
        tax: 0, // Optional: calculate tax
        discount: 0, // Optional: apply discount
        total: total,
        payment: {
          method: paymentData.method,
          amount: paymentData.amountPaid,
          change: change > 0 ? change : 0,
        },
        notes: 'Terima kasih telah berbelanja di Bahann POS',
      }

      setReceiptData(receipt)
      setIsPrintModalOpen(true)

      // Reset form
      setFormData({
        ...formData,
        productName: '',
        productSku: '',
        quantitySold: 1,
        unitPrice: 0,
      })
      setPaymentData({
        method: 'cash',
        amountPaid: 0,
      })
    } catch (error: any) {
      alert(error.message || 'Failed to record sale')
    }
  }

  const totalRevenue = formData.quantitySold * formData.unitPrice
  const change = paymentData.amountPaid - totalRevenue

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
              {/* Product Information */}
              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h3 className="text-sm font-bold text-blue-900 mb-3">Product Information</h3>

                <Input
                  type="text"
                  label="Product ID"
                  placeholder="Enter product UUID"
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  fullWidth
                  required
                />

                <div className="mt-3">
                  <Input
                    type="text"
                    label="Product Name"
                    placeholder="Enter product name"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    fullWidth
                    required
                  />
                </div>

                <div className="mt-3">
                  <Input
                    type="text"
                    label="SKU"
                    placeholder="Enter product SKU"
                    value={formData.productSku}
                    onChange={(e) => setFormData({ ...formData, productSku: e.target.value })}
                    fullWidth
                    required
                  />
                </div>
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Quantity"
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
                  step="1"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  fullWidth
                  required
                />
              </div>

              {/* Payment Information */}
              <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <h3 className="text-sm font-bold text-green-900 mb-3">Payment Information</h3>

                <Select
                  label="Payment Method"
                  value={paymentData.method}
                  onChange={(e: any) => setPaymentData({ ...paymentData, method: e.target.value })}
                  options={[
                    { value: 'cash', label: 'Cash' },
                    { value: 'card', label: 'Debit/Credit Card' },
                    { value: 'transfer', label: 'Bank Transfer' },
                    { value: 'ewallet', label: 'E-Wallet (GoPay, OVO, Dana)' },
                  ]}
                  fullWidth
                />

                <div className="mt-3">
                  <Input
                    type="number"
                    label="Amount Paid (Rp)"
                    min="0"
                    step="1"
                    value={paymentData.amountPaid}
                    onChange={(e) => setPaymentData({ ...paymentData, amountPaid: parseFloat(e.target.value) || 0 })}
                    fullWidth
                    required
                  />
                </div>

                {change >= 0 && paymentData.amountPaid > 0 && (
                  <div className="mt-3 p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600">Change</p>
                    <p className="text-xl font-bold text-green-700">
                      Rp {change.toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              </div>

              {/* Total Revenue Display */}
              <div className="p-6 bg-gray-900 rounded-xl border-2 border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-white">
                  Rp {totalRevenue.toLocaleString('id-ID')}
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={recordSaleMutation.isPending || change < 0}
              >
                {recordSaleMutation.isPending ? 'Processing...' : '🛒 Complete Sale & Print'}
              </Button>

              {change < 0 && paymentData.amountPaid > 0 && (
                <p className="text-sm text-red-600 text-center">
                  ⚠️ Insufficient payment amount
                </p>
              )}
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

      {/* Print Preview Modal */}
      {receiptData && (
        <PrintPreviewModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          receiptData={receiptData}
        />
      )}
    </div>
  )
}

/**
 * Generate unique transaction ID
 */
function generateTransactionId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 7)
  return `TRX-${timestamp}-${random}`.toUpperCase()
}

/**
 * Get current user name from session/localStorage
 */
function getUserName(): string {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        return userData.name || 'Cashier'
      } catch {
        return 'Cashier'
      }
    }
  }
  return 'Cashier'
}
