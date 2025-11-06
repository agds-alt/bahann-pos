'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [selectedOutletId, setSelectedOutletId] = useState<string>('')
  const [dateRange, setDateRange] = useState<7 | 14 | 30>(7)

  // Fetch outlets for filter
  const { data: outlets } = trpc.outlets.getAll.useQuery()

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.getStats.useQuery({
    outletId: selectedOutletId || undefined,
  })

  const { data: salesTrend, isLoading: trendLoading } = trpc.dashboard.getSalesTrend.useQuery({
    outletId: selectedOutletId || undefined,
    days: dateRange,
  })

  const { data: topProducts, isLoading: topProductsLoading } = trpc.dashboard.getTopProducts.useQuery({
    outletId: selectedOutletId || undefined,
    days: dateRange,
  })

  const { data: lowStock, isLoading: lowStockLoading } = trpc.dashboard.getLowStock.useQuery({
    outletId: selectedOutletId || undefined,
    threshold: 10,
  })

  const { data: recentTransactions, isLoading: transactionsLoading } = trpc.dashboard.getRecentTransactions.useQuery({
    outletId: selectedOutletId || undefined,
    limit: 5,
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-8">
      {/* Header with Filters */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('dashboard.title')}</h1>
            <p className="text-gray-600">{t('dashboard.overview')}</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={selectedOutletId}
              onChange={(e) => setSelectedOutletId(e.target.value)}
              options={[
                { value: '', label: t('dashboard.allOutlets') },
                ...(outlets?.map(outlet => ({
                  value: outlet.id,
                  label: outlet.name,
                })) || []),
              ]}
            />
            <Select
              value={dateRange.toString()}
              onChange={(e) => setDateRange(Number(e.target.value) as 7 | 14 | 30)}
              options={[
                { value: '7', label: t('dashboard.last7days') },
                { value: '14', label: '14 ' + t('common.day') },
                { value: '30', label: t('dashboard.last30days') },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">{t('dashboard.totalProducts')}</p>
            {statsLoading ? (
              <div className="h-9 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalProducts.toLocaleString() || 0}
              </p>
            )}
            <p className="text-sm text-gray-600">In inventory</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">{t('dashboard.totalRevenue')}</p>
            {statsLoading ? (
              <div className="h-9 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats?.totalRevenue || 0)}
              </p>
            )}
            <p className="text-sm text-green-600">{stats?.transactionCount || 0} {t('dashboard.transactions')}</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">{t('dashboard.lowStock')}</p>
            {statsLoading ? (
              <div className="h-9 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">
                {stats?.lowStockCount || 0}
              </p>
            )}
            <p className={`text-sm ${(stats?.lowStockCount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {(stats?.lowStockCount || 0) > 0 ? t('warehouse.stock.lowStockAlert') : t('warehouse.stock.noLowStock')}
            </p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">{t('dashboard.totalOutlets')}</p>
            {statsLoading ? (
              <div className="h-9 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalOutlets || 0}
              </p>
            )}
            <p className="text-sm text-gray-600">Active locations</p>
          </div>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Sales Trend (Last {dateRange} Days)</CardTitle>
        </CardHeader>
        <CardBody>
          {trendLoading ? (
            <div className="h-64 bg-gray-100 rounded animate-pulse" />
          ) : salesTrend && salesTrend.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#6b7280"
                  />
                  <YAxis
                    stroke="#6b7280"
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={formatDate}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No sales data available for the selected period
            </div>
          )}
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/warehouse/stock')}
            >
              📦 Record Stock
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/pos/sales')}
            >
              🛒 New Sale
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/products')}
            >
              📋 Manage Products
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/outlets')}
            >
              🏪 Manage Outlets
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Low Stock Alert */}
      {lowStock && lowStock.length > 0 && (
        <Card variant="default" padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>⚠️ Low Stock Alert</CardTitle>
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                {lowStock.length} items
              </span>
            </div>
          </CardHeader>
          <CardBody>
            {lowStockLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {lowStock.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        {item.outletName} • SKU: {item.productSku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">{item.currentStock}</p>
                      <p className="text-xs text-gray-500">units left</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>🏆 Top Selling Products</CardTitle>
          </CardHeader>
          <CardBody>
            {topProductsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : topProducts && topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.productName}</p>
                        <p className="text-sm text-gray-500">SKU: {product.productSku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{product.totalQuantity} units</p>
                      <p className="text-sm text-green-600">{formatCurrency(product.totalRevenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                No sales data available
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Transactions */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>📊 Recent Transactions</CardTitle>
          </CardHeader>
          <CardBody>
            {transactionsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : recentTransactions && recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{transaction.productName}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.outletName} • {formatDateTime(transaction.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{transaction.quantity} units</p>
                      <p className="text-sm text-green-600">{formatCurrency(transaction.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                No recent transactions
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
