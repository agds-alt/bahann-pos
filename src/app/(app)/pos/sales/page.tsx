'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { PrintPreviewModal } from '@/components/print/PrintPreviewModal'
import { ReceiptData } from '@/components/print/PrintReceipt'
import { formatCurrency, formatDateTime, generateTransactionId } from '@/lib/utils'

interface CartItem {
  productId: string
  productName: string
  productSku: string
  quantity: number
  unitPrice: number
  total: number
}

export default function SalesTransactionPage() {
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedOutletId, setSelectedOutletId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState<CartItem[]>([])
  const [saleDate] = useState(new Date().toISOString().split('T')[0])

  const [paymentData, setPaymentData] = useState({
    method: 'cash',
    amountPaid: 0,
  })

  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{
    discountAmount: number
    promoName: string
    promoId: string
  } | null>(null)

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  // Fetch products and outlets for dropdowns
  const { data: productsResponse, isLoading: productsLoading } = trpc.products.getAll.useQuery()
  const { data: outletsResponse, isLoading: outletsLoading } = trpc.outlets.getAll.useQuery()

  const products = productsResponse?.products || []
  const outlets = outletsResponse?.outlets || []

  // Fetch inventory with stock (filtered by selected outlet)
  const { data: inventoryList } = trpc.stock.getInventoryList.useQuery({
    outletId: selectedOutletId || undefined,
  }, {
    enabled: !!selectedOutletId, // Only fetch when outlet is selected
  })

  // Fetch real dashboard data
  const { data: recentTransactions, refetch: refetchTransactions } = trpc.dashboard.getRecentTransactions.useQuery({ limit: 5 })

  const recordSaleMutation = trpc.sales.record.useMutation()
  const createTransactionMutation = trpc.transactions.create.useMutation()
  const validatePromoMutation = trpc.promotions.validate.useMutation()
  const recordPromoUsageMutation = trpc.promotions.recordUsage.useMutation()

  const selectedProduct = products?.find(p => p.id === selectedProductId)
  const selectedOutlet = outlets?.find(o => o.id === selectedOutletId)

  // Get stock info for selected product
  const selectedProductStock = inventoryList?.find(p => p.id === selectedProductId)
  const availableStock = selectedProductStock?.currentStock || 0

  // Add item to cart
  const handleAddToCart = () => {
    if (!selectedProduct) {
      setError('Please select a product')
      return
    }

    if (quantity <= 0) {
      setError('Quantity must be greater than 0')
      return
    }

    // Check stock availability
    if (selectedOutletId && availableStock < quantity) {
      setError(`Insufficient stock! Only ${availableStock} units available`)
      return
    }

    const unitPrice = selectedProduct.price || 0
    const total = quantity * unitPrice

    // Check if product already in cart
    const existingItemIndex = cart.findIndex(item => item.productId === selectedProduct.id)

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedCart = [...cart]
      updatedCart[existingItemIndex].quantity += quantity
      updatedCart[existingItemIndex].total = updatedCart[existingItemIndex].quantity * unitPrice
      setCart(updatedCart)
    } else {
      // Add new item
      const newItem: CartItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productSku: selectedProduct.sku,
        quantity,
        unitPrice,
        total,
      }
      setCart([...cart, newItem])
    }

    // Reset selection
    setSelectedProductId('')
    setQuantity(1)
    setError('')
  }

  // Remove item from cart
  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId))
  }

  // Update cart item quantity
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) return

    const updatedCart = cart.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.unitPrice,
        }
      }
      return item
    })
    setCart(updatedCart)
  }

  // Calculate cart totals
  const cartSubtotal = cart.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = appliedPromo?.discountAmount || 0
  const cartTotal = cartSubtotal - discountAmount // Apply discount
  const change = paymentData.amountPaid - cartTotal

  // Handle apply promo code
  const handleApplyPromo = async () => {
    if (!promoCode) {
      setError('Please enter a promo code')
      return
    }

    try {
      const result = await validatePromoMutation.mutateAsync({
        code: promoCode,
        cartTotal: cartSubtotal,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      })

      setAppliedPromo(result)
      setError('')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid promo code'
      setError(errorMessage)
      setAppliedPromo(null)
    }
  }

  // Remove promo
  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCode('')
  }

  // Complete sale
  const handleCompleteSale = async () => {
    setError('')
    setShowSuccess(false)

    if (cart.length === 0) {
      setError('Cart is empty. Please add items to cart.')
      return
    }

    if (!selectedOutletId) {
      setError('Please select an outlet')
      return
    }

    if (paymentData.amountPaid < cartTotal) {
      setError('Insufficient payment amount')
      return
    }

    try {
      // Create transaction using new system
      const result = await createTransactionMutation.mutateAsync({
        outletId: selectedOutletId,
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        paymentMethod: paymentData.method as 'cash' | 'card' | 'transfer' | 'ewallet',
        amountPaid: paymentData.amountPaid,
        discountAmount: discountAmount,
        notes: appliedPromo ? `Promo applied: ${appliedPromo.promoName}` : undefined,
      })

      // Record promotion usage if applied
      if (appliedPromo && result.transaction) {
        await recordPromoUsageMutation.mutateAsync({
          promotionId: appliedPromo.promoId,
          transactionId: result.transaction.id,
          discountApplied: discountAmount,
        })
      }

      // Generate receipt data
      const now = new Date()

      const receipt: ReceiptData = {
        transactionId: result.transactionId,
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
        cashier: getUserName(),
        outlet: {
          name: selectedOutlet?.name || 'AGDS Corp POS',
          address: selectedOutlet?.address || 'Indonesia',
          phone: '+62 878-7441-5491',
          email: 'agdscid@gmail.com',
        },
        items: cart.map(item => ({
          name: item.productName,
          sku: item.productSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
        subtotal: cartSubtotal,
        tax: 0,
        discount: discountAmount,
        total: cartTotal,
        payment: {
          method: paymentData.method,
          amount: paymentData.amountPaid,
          change: change > 0 ? change : 0,
        },
        notes: appliedPromo
          ? `Promo: ${appliedPromo.promoName} • Terima kasih!`
          : 'Terima kasih telah berbelanja di AGDS Corp POS',
      }

      setReceiptData(receipt)
      setIsPrintModalOpen(true)
      setShowSuccess(true)

      // Refetch transactions
      refetchTransactions()

      // Reset form
      setCart([])
      setPaymentData({
        method: 'cash',
        amountPaid: 0,
      })
      setSelectedOutletId('')
      setPromoCode('')
      setAppliedPromo(null)

      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record sale'
      setError(errorMessage)
    }
  }

  // Using centralized utility functions for formatting

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Point of Sale</h1>
        <p className="text-gray-600">Process sales transactions with multi-item cart</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
          <p className="text-sm font-semibold text-green-600">
            ✅ Sale completed successfully!
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <p className="text-sm font-semibold text-red-600">
            ❌ {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product Selection + Cart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Outlet Selection */}
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <CardTitle>Select Outlet</CardTitle>
            </CardHeader>
            <CardBody>
              <Select
                value={selectedOutletId}
                onChange={(e) => setSelectedOutletId(e.target.value)}
                options={[
                  { value: '', label: 'Choose an outlet...' },
                  ...(outlets?.map(outlet => ({
                    value: outlet.id,
                    label: `${outlet.name} - ${outlet.address}`,
                  })) || []),
                ]}
                fullWidth
                required
              />
              {selectedOutlet && (
                <div className="mt-3 p-3 bg-purple-50 border-2 border-purple-200 rounded-xl">
                  <p className="text-xs text-purple-600 font-semibold">Selected Outlet:</p>
                  <p className="text-sm font-semibold text-purple-900">{selectedOutlet.name}</p>
                  <p className="text-xs text-purple-700">{selectedOutlet.address}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Add Product to Cart */}
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <CardTitle>Add Item to Cart</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {!selectedOutletId && (
                  <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                    <p className="text-xs text-yellow-800 font-semibold">
                      ⚠️ Please select an outlet first to view product stock
                    </p>
                  </div>
                )}
                <Select
                  label="Select Product"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  options={[
                    { value: '', label: selectedOutletId ? 'Choose a product...' : 'Select outlet first...' },
                    ...(products?.map(product => {
                      const stockInfo = inventoryList?.find(p => p.id === product.id)
                      const stock = stockInfo?.currentStock || 0
                      const stockLabel = selectedOutletId
                        ? ` • Stock: ${stock}`
                        : ''
                      return {
                        value: product.id,
                        label: `${product.name} - ${formatCurrency(product.price || 0)}${stockLabel}`,
                      }
                    }) || []),
                  ]}
                  fullWidth
                  disabled={!selectedOutletId}
                />

                {selectedProduct && (
                  <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-xs text-blue-600 font-semibold">Selected Product:</p>
                        <p className="text-sm font-semibold text-blue-900">{selectedProduct.name}</p>
                        <p className="text-xs text-blue-700">
                          SKU: {selectedProduct.sku} • {selectedProduct.category || 'N/A'}
                        </p>
                        {selectedOutletId && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`text-xs font-bold ${
                              availableStock === 0 ? 'text-red-600' :
                              availableStock <= 10 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {availableStock === 0 ? '❌ Out of stock' :
                               availableStock <= 10 ? `⚠️ Low stock: ${availableStock} units` :
                               `✅ In stock: ${availableStock} units`}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-900">
                          {formatCurrency(selectedProduct.price || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="number"
                      label="Quantity"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      fullWidth
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="primary"
                      onClick={handleAddToCart}
                      disabled={!selectedProduct || productsLoading || (!!selectedOutletId && availableStock === 0)}
                    >
                      ➕ Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Shopping Cart */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>🛒 Shopping Cart</CardTitle>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  {cart.length} items
                </span>
              </div>
            </CardHeader>
            <CardBody>
              {cart.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="font-semibold">Cart is empty</p>
                  <p className="text-sm">Add products to start a transaction</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">SKU: {item.productSku}</p>
                        <p className="text-sm text-gray-700 font-semibold">
                          {formatCurrency(item.unitPrice)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-12 text-center font-bold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <div className="w-32 text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(item.total)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFromCart(item.productId)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Cart Total */}
                  <div className="p-4 bg-gray-900 rounded-xl border-2 border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Cart Total</p>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(cartTotal)}
                    </p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Payment & Summary */}
        <div className="space-y-6">
          {/* Payment Section */}
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Select
                  label="Payment Method"
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                  options={[
                    { value: 'cash', label: '💵 Cash' },
                    { value: 'card', label: '💳 Card' },
                    { value: 'transfer', label: '🏦 Transfer' },
                    { value: 'ewallet', label: '📱 E-Wallet' },
                  ]}
                  fullWidth
                />

                {/* Promo Code Section */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Promo Code (Optional)
                  </label>
                  {!appliedPromo ? (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        fullWidth
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyPromo}
                        disabled={!promoCode || validatePromoMutation.isPending}
                      >
                        {validatePromoMutation.isPending ? 'Checking...' : 'Apply'}
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-green-600 font-semibold">Applied</p>
                          <p className="text-sm font-bold text-green-900">{appliedPromo.promoName}</p>
                          <p className="text-xs text-green-700">
                            Discount: -{formatCurrency(appliedPromo.discountAmount)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemovePromo}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart Summary */}
                {cart.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(cartSubtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount:</span>
                        <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                  </div>
                )}

                <Input
                  type="number"
                  label="Amount Paid"
                  min="0"
                  step="1000"
                  value={paymentData.amountPaid}
                  onChange={(e) => setPaymentData({ ...paymentData, amountPaid: parseFloat(e.target.value) || 0 })}
                  fullWidth
                  required
                />

                {change >= 0 && paymentData.amountPaid > 0 && (
                  <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                    <p className="text-sm text-green-700 font-semibold">Change</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(change)}
                    </p>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleCompleteSale}
                  disabled={recordSaleMutation.isPending || cart.length === 0 || !selectedOutletId || change < 0}
                >
                  {recordSaleMutation.isPending ? 'Processing...' : '✅ Complete Sale & Print'}
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Session Stats</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Items in Cart</p>
                  <p className="text-xl font-bold text-gray-900">{cart.length}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Total Units</p>
                  <p className="text-xl font-bold text-gray-900">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700">Cart Value</p>
                  <p className="text-xl font-bold text-green-900">{formatCurrency(cartTotal)}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card variant="default" padding="lg">
        <CardHeader>
          <CardTitle>📊 Recent Transactions</CardTitle>
        </CardHeader>
        <CardBody>
          {!recentTransactions || recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No recent transactions
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{transaction.productName}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.outletName} • {formatDateTime(transaction.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(transaction.revenue)}</p>
                    <p className="text-xs text-gray-500">{transaction.quantity} units</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
