'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { PrintPreviewModal } from '@/components/print/PrintPreviewModal'
import { ReceiptData } from '@/components/print/PrintReceipt'
import { BarcodeScanner } from '@/components/barcode/BarcodeScanner'
import { PaymentModal } from '@/components/payment'
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
  const [isPromoExpanded, setIsPromoExpanded] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState('')
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [pendingTransactionId, setPendingTransactionId] = useState<string>('')

  // Refs for keyboard navigation
  const productSelectRef = useRef<HTMLSelectElement>(null)
  const quantityInputRef = useRef<HTMLInputElement>(null)
  const barcodeInputRef = useRef<HTMLInputElement>(null)

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
      setError('Silakan pilih produk')
      return
    }

    if (quantity <= 0) {
      setError('Jumlah harus lebih dari 0')
      return
    }

    // Check stock availability
    if (selectedOutletId && availableStock < quantity) {
      setError(`Stok tidak cukup! Hanya ${availableStock} unit tersedia`)
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

    // Reset selection and focus back to product dropdown
    setSelectedProductId('')
    setQuantity(1)
    setError('')

    // Auto-focus back to product select for quick next entry
    setTimeout(() => {
      productSelectRef.current?.focus()
    }, 100)
  }

  // Quick quantity buttons
  const handleQuickQuantity = (qty: number) => {
    setQuantity(qty)
  }

  // Barcode scan handler (for camera scanner)
  const handleBarcodeScan = (barcode: string) => {
    // Find product by SKU
    const product = products?.find(p => p.sku === barcode.toUpperCase())

    if (product) {
      setSelectedProductId(product.id)
      setQuantity(1)

      // Auto-add to cart
      setTimeout(() => {
        const unitPrice = product.price || 0
        const newItem: CartItem = {
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity: 1,
          unitPrice,
          total: unitPrice,
        }

        // Check if product already in cart
        const existingIndex = cart.findIndex(item => item.productId === product.id)
        if (existingIndex !== -1) {
          const newCart = [...cart]
          newCart[existingIndex].quantity += 1
          newCart[existingIndex].total = newCart[existingIndex].quantity * unitPrice
          setCart(newCart)
        } else {
          setCart([...cart, newItem])
        }

        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)
      }, 100)
    } else {
      setError(`Produk dengan barcode ${barcode} tidak ditemukan`)
      setTimeout(() => setError(''), 3000)
    }

    setIsScannerOpen(false)
  }

  // Barcode manual input handler (for USB scanner)
  const handleBarcodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarcodeInput(e.target.value.toUpperCase())
  }

  const handleBarcodeInputSubmit = () => {
    if (barcodeInput.trim()) {
      handleBarcodeScan(barcodeInput.trim())
      setBarcodeInput('')
    }
  }

  // Auto-add to cart when product is selected (optional, can be toggled)
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId)
    // Auto-focus quantity input when product selected
    if (productId) {
      setTimeout(() => {
        quantityInputRef.current?.focus()
        quantityInputRef.current?.select()
      }, 100)
    }
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // F2: Focus product dropdown
      if (e.key === 'F2') {
        e.preventDefault()
        productSelectRef.current?.focus()
      }
      // F8: Complete sale (if cart has items and valid payment)
      if (e.key === 'F8') {
        e.preventDefault()
        if (cart.length > 0 && selectedOutletId) {
          handleCompleteSale()
        }
      }
      // Escape: Clear error
      if (e.key === 'Escape') {
        setError('')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [cart, selectedOutletId])

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

  // Complete sale - Always use PaymentModal
  const handleCompleteSale = async () => {
    setError('')
    setShowSuccess(false)

    if (cart.length === 0) {
      setError('Keranjang kosong. Silakan tambahkan item ke keranjang.')
      return
    }

    if (!selectedOutletId) {
      setError('Silakan pilih outlet')
      return
    }

    // Generate transaction ID and open PaymentModal
    const transactionId = generateTransactionId()
    setPendingTransactionId(transactionId)
    setIsPaymentModalOpen(true)
  }

  // Handle payment success from PaymentModal
  const handlePaymentSuccess = async (paymentId: string, paymentMethod: string) => {
    try {
      // Close payment modal
      setIsPaymentModalOpen(false)

      // Create transaction with payment ID
      const result = await createTransactionMutation.mutateAsync({
        outletId: selectedOutletId,
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        paymentMethod: paymentMethod as 'cash' | 'card' | 'transfer' | 'ewallet',
        amountPaid: cartTotal,
        discountAmount: discountAmount,
        notes: appliedPromo
          ? `Promo applied: ${appliedPromo.promoName} | Payment ID: ${paymentId}`
          : `Payment ID: ${paymentId}`,
      })

      // Record promotion usage if applied
      if (appliedPromo && result.transaction) {
        await recordPromoUsageMutation.mutateAsync({
          promotionId: appliedPromo.promoId,
          transactionId: result.transaction.id,
          discountApplied: discountAmount,
        })
      }

      // Generate receipt
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
          method: paymentMethod,
          amount: cartTotal,
          change: 0,
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
      setSelectedOutletId('')
      setPromoCode('')
      setAppliedPromo(null)
      setPendingTransactionId('')

      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mencatat penjualan'
      setError(errorMessage)
    }
  }

  // Using centralized utility functions for formatting

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Point of Sale</h1>
        <p className="text-gray-600">Proses transaksi penjualan dengan keranjang multi-item</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
          <p className="text-sm font-semibold text-green-600">
            ✅ Penjualan berhasil dicatat!
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
              <CardTitle>Pilih Outlet</CardTitle>
            </CardHeader>
            <CardBody>
              <Select
                value={selectedOutletId}
                onChange={(e) => setSelectedOutletId(e.target.value)}
                options={[
                  { value: '', label: 'Pilih outlet...' },
                  ...(outlets?.map(outlet => ({
                    value: outlet.id,
                    label: outlet.address ? `${outlet.name} - ${outlet.address}` : outlet.name,
                  })) || []),
                ]}
                fullWidth
                required
              />
              {selectedOutlet && (
                <div className="mt-3 p-3 bg-purple-50 border-2 border-purple-200 rounded-xl">
                  <p className="text-xs text-purple-600 font-semibold">Outlet Terpilih:</p>
                  <p className="text-sm font-semibold text-purple-900">{selectedOutlet.name}</p>
                  <p className="text-xs text-purple-700">{selectedOutlet.address}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Add Product to Cart */}
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <CardTitle>Tambah Item ke Keranjang</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {!selectedOutletId && (
                  <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                    <p className="text-xs text-yellow-800 font-semibold">
                      ⚠️ Silakan pilih outlet terlebih dahulu untuk melihat stok produk
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Pilih Produk
                  </label>
                  <select
                    ref={productSelectRef}
                    value={selectedProductId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    disabled={!selectedOutletId}
                    className="input-mobile w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {selectedOutletId ? 'Pilih produk...' : 'Pilih outlet terlebih dahulu...'}
                    </option>
                    {products?.map(product => {
                      const stockInfo = inventoryList?.find(p => p.id === product.id)
                      const stock = stockInfo?.currentStock || 0
                      const stockStatus = stock === 0 ? '❌ Habis' : stock <= 10 ? '⚠️ Sedikit' : '✅'

                      return (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.price || 0)} - {stockStatus} {stock} pcs
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Barcode Scanner Section - Enhanced visibility for mobile */}
                <div className="space-y-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-4 border-purple-400 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📷</span>
                    <p className="text-base font-bold text-gray-900">Scan Barcode</p>
                  </div>

                  {/* Barcode Manual Input (USB Scanner) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      📟 Input Barcode Manual / USB Scanner
                    </label>
                    <div className="flex gap-2">
                      <input
                        ref={barcodeInputRef}
                        type="text"
                        value={barcodeInput}
                        onChange={handleBarcodeInputChange}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleBarcodeInputSubmit()
                          }
                        }}
                        placeholder="Scan atau ketik SKU produk..."
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all uppercase"
                        disabled={!selectedOutletId}
                      />
                      <Button
                        variant="primary"
                        onClick={handleBarcodeInputSubmit}
                        disabled={!selectedOutletId || !barcodeInput.trim()}
                        className="min-w-[80px]"
                      >
                        ✓ OK
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      💡 Tekan <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> setelah scan
                    </p>
                  </div>

                  {/* Camera Scanner Button */}
                  <div className="pt-2 border-t-2 border-purple-300">
                    <Button
                      variant="secondary"
                      onClick={() => setIsScannerOpen(true)}
                      disabled={!selectedOutletId}
                      fullWidth
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-3 shadow-md"
                    >
                      📷 Buka Kamera Scanner
                    </Button>
                  </div>
                </div>

                {selectedProduct && (
                  <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-xs text-blue-600 font-semibold">Produk Terpilih:</p>
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
                              {availableStock === 0 ? '❌ Stok habis' :
                               availableStock <= 10 ? `⚠️ Stok sedikit: ${availableStock} unit` :
                               `✅ Tersedia: ${availableStock} unit`}
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

                {/* Quick Quantity Buttons */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Jumlah Cepat
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 5, 10].map(qty => (
                      <Button
                        key={qty}
                        variant={quantity === qty ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleQuickQuantity(qty)}
                        className="w-full"
                      >
                        {qty}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Atau Masukkan Manual
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        ref={quantityInputRef}
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddToCart()
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        className="input-mobile w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Qty"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleAddToCart}
                        disabled={!selectedProduct || productsLoading || (!!selectedOutletId && availableStock === 0)}
                      >
                        ➕ Tambah
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    💡 Tekan <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> untuk tambah ke keranjang
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Shopping Cart */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>🛒 Keranjang Belanja</CardTitle>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  {cart.length} item
                </span>
              </div>
            </CardHeader>
            <CardBody>
              {cart.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="font-semibold">Keranjang kosong</p>
                  <p className="text-sm">Tambahkan produk untuk memulai transaksi</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl border-2 border-gray-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">SKU: {item.productSku}</p>
                        <p className="text-xs sm:text-sm text-gray-700 font-semibold">
                          {formatCurrency(item.unitPrice)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            className="min-w-[36px] sm:min-w-[40px] px-2"
                          >
                            -
                          </Button>
                          <span className="w-8 sm:w-12 text-center font-bold text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            className="min-w-[36px] sm:min-w-[40px] px-2"
                          >
                            +
                          </Button>
                        </div>
                        <div className="min-w-[80px] sm:min-w-[120px] text-right">
                          <p className="text-base sm:text-lg font-bold text-gray-900">
                            {formatCurrency(item.total)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFromCart(item.productId)}
                          className="min-w-[36px] sm:min-w-[40px] px-2"
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Cart Total */}
                  <div className="p-4 bg-gray-900 rounded-xl border-2 border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Total Keranjang</p>
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
              <CardTitle>Pembayaran</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {/* Promo Code Section - Collapsible */}
                <div>
                  <button
                    onClick={() => setIsPromoExpanded(!isPromoExpanded)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <label className="block text-sm font-semibold text-gray-700 cursor-pointer">
                      🎫 Kode Promo (Opsional)
                    </label>
                    <span className="text-gray-400">
                      {isPromoExpanded ? '▲' : '▼'}
                    </span>
                  </button>

                  {isPromoExpanded && !appliedPromo && (
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="text"
                        placeholder="Masukkan kode promo"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        fullWidth
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyPromo}
                        disabled={!promoCode || validatePromoMutation.isPending}
                      >
                        {validatePromoMutation.isPending ? 'Memeriksa...' : 'Terapkan'}
                      </Button>
                    </div>
                  )}

                  {appliedPromo && (
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl mt-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-xs text-green-600 font-semibold mb-1">✓ Promo Diterapkan</p>
                          <p className="text-sm font-bold text-green-900 mb-1">{appliedPromo.promoName}</p>
                          <p className="text-sm text-green-700 font-semibold">
                            Hemat: {formatCurrency(appliedPromo.discountAmount)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemovePromo}
                          className="shrink-0"
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart Summary */}
                {cart.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(cartSubtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Diskon:</span>
                        <span className="font-semibold text-green-600">-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-gray-300">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-blue-600">{formatCurrency(cartTotal)}</span>
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleCompleteSale}
                  disabled={recordSaleMutation.isPending || cart.length === 0 || !selectedOutletId}
                >
                  {recordSaleMutation.isPending ? 'Memproses...' : '💳 Lanjut ke Pembayaran'}
                </Button>

                {/* Keyboard Shortcuts Helper */}
                <div className="p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <p className="text-xs text-blue-900 font-semibold mb-2">⌨️ Shortcut Keyboard:</p>
                  <div className="space-y-1 text-xs text-blue-700">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-white rounded border border-blue-200">F2</kbd>
                      <span>Fokus ke pilihan produk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-white rounded border border-blue-200">Enter</kbd>
                      <span>Tambah ke keranjang</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-white rounded border border-blue-200">F8</kbd>
                      <span>Selesaikan transaksi</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Statistik Sesi</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Item di Keranjang</p>
                  <p className="text-xl font-bold text-gray-900">{cart.length}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Total Unit</p>
                  <p className="text-xl font-bold text-gray-900">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700">Nilai Keranjang</p>
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
          <CardTitle>📊 Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardBody>
          {!recentTransactions || recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Tidak ada transaksi terbaru
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

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* Payment Modal for QRIS/Bank Transfer */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false)
          setPendingTransactionId('')
        }}
        transactionId={pendingTransactionId}
        amount={cartTotal}
        customerName={selectedOutlet?.name}
        userId={getUserId()}
        onSuccess={handlePaymentSuccess}
        onError={(error) => {
          setError(error)
          setIsPaymentModalOpen(false)
        }}
      />
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

/**
 * Get current user ID from session/localStorage
 */
function getUserId(): string {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        return userData.id || 'anonymous'
      } catch {
        return 'anonymous'
      }
    }
  }
  return 'anonymous'
}
