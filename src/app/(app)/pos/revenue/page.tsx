'use client'

import { lazy, Suspense, useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { ChartSkeleton } from '@/components/ui/Skeletons'

// Lazy load chart components - only loaded when needed
const RevenueAreaChart = lazy(() => import('@/components/charts/RevenueAreaChartLazy'))
const DailyRevenueBarChart = lazy(() => import('@/components/charts/DailyRevenueBarChartLazy'))

export default function RevenueTrackingPage() {
  const [selectedOutletId, setSelectedOutletId] = useState('')
  const [dateRange, setDateRange] = useState<7 | 14 | 30>(7)

  // Fetch data
  const { data: outletsResponse } = trpc.outlets.getAll.useQuery()
  const outlets = outletsResponse?.outlets || []
  const { data: stats } = trpc.dashboard.getStats.useQuery({
    outletId: selectedOutletId || undefined,
  })
  const { data: salesTrend } = trpc.dashboard.getSalesTrend.useQuery({
    outletId: selectedOutletId || undefined,
    days: dateRange,
  })
  const { data: recentTransactions } = trpc.dashboard.getRecentTransactions.useQuery({
    outletId: selectedOutletId || undefined,
    limit: 10,
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

  // Calculate growth
  const calculateGrowth = () => {
    if (!salesTrend || salesTrend.length < 2) return 0

    const halfPoint = Math.floor(salesTrend.length / 2)
    const firstHalf = salesTrend.slice(0, halfPoint)
    const secondHalf = salesTrend.slice(halfPoint)

    const firstHalfRevenue = firstHalf.reduce((sum, day) => sum + day.revenue, 0)
    const secondHalfRevenue = secondHalf.reduce((sum, day) => sum + day.revenue, 0)

    if (firstHalfRevenue === 0) return 0
    return ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100
  }

  const growthRate = calculateGrowth()
  const totalRevenue = salesTrend?.reduce((sum, day) => sum + day.revenue, 0) || 0
  const averageDaily = salesTrend && salesTrend.length > 0 ? totalRevenue / salesTrend.length : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Revenue Tracking</h1>
        <p className="text-gray-600">Monitor real-time revenue and performance metrics</p>
      </div>

      {/* Filters */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Tracking Filters</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Outlet"
              value={selectedOutletId}
              onChange={(e) => setSelectedOutletId(e.target.value)}
              options={[
                { value: '', label: 'All Outlets' },
                ...outlets.map(outlet => ({
                  value: outlet.id,
                  label: outlet.name,
                })),
              ]}
              fullWidth
            />
            <Select
              label="Time Period"
              value={dateRange.toString()}
              onChange={(e) => setDateRange(Number(e.target.value) as 7 | 14 | 30)}
              options={[
                { value: '7', label: 'Last 7 Days' },
                { value: '14', label: 'Last 14 Days' },
                { value: '30', label: 'Last 30 Days' },
              ]}
              fullWidth
            />
          </div>
        </CardBody>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-sm text-gray-600">{dateRange} days</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Daily Average</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(averageDaily)}
            </p>
            <p className="text-sm text-gray-600">Per day</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Growth Rate</p>
            <p className={`text-3xl font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Period-over-period</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Transactions</p>
            <p className="text-3xl font-bold text-purple-600">
              {stats?.transactionCount || 0}
            </p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </Card>
      </div>

      {/* Revenue Trend Area Chart */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>💰 Revenue Trend</CardTitle>
        </CardHeader>
        <CardBody>
          {salesTrend && salesTrend.length > 0 ? (
            <Suspense fallback={<ChartSkeleton height={384} />}>
              <RevenueAreaChart
                data={salesTrend}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                height={384}
              />
            </Suspense>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              No revenue data available
            </div>
          )}
        </CardBody>
      </Card>

      {/* Daily Comparison */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>📊 Daily Revenue Comparison</CardTitle>
        </CardHeader>
        <CardBody>
          {salesTrend && salesTrend.length > 0 ? (
            <Suspense fallback={<ChartSkeleton height={320} />}>
              <DailyRevenueBarChart
                data={salesTrend}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                height={320}
              />
            </Suspense>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </CardBody>
      </Card>

      {/* Recent High-Value Transactions */}
      <Card variant="default" padding="lg">
        <CardHeader>
          <CardTitle>💎 Recent Transactions</CardTitle>
        </CardHeader>
        <CardBody>
          {recentTransactions && recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border-2 border-gray-200"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{transaction.productName}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.outletName} • {formatDateTime(transaction.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(transaction.revenue)}
                    </p>
                    <p className="text-xs text-gray-500">{transaction.quantity} units</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <div className="text-6xl mb-4">💰</div>
              <p className="font-semibold">No transactions found</p>
              <p className="text-sm">Start processing sales to track revenue</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>📈 Performance Metrics</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <div>
                  <p className="text-sm text-green-700 font-semibold">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <div className="text-4xl">💰</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div>
                  <p className="text-sm text-blue-700 font-semibold">Avg Transaction Value</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(
                      stats?.transactionCount && stats.transactionCount > 0
                        ? stats.totalRevenue / stats.transactionCount
                        : 0
                    )}
                  </p>
                </div>
                <div className="text-4xl">💳</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                <div>
                  <p className="text-sm text-purple-700 font-semibold">Items Sold</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {stats?.totalItemsSold.toLocaleString() || 0}
                  </p>
                </div>
                <div className="text-4xl">📦</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>🎯 Revenue Goals</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Daily Target</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(5000000)}
                  </p>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600"
                    style={{
                      width: `${Math.min((averageDaily / 5000000) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((averageDaily / 5000000) * 100).toFixed(1)}% achieved
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Monthly Target</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(150000000)}
                  </p>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                    style={{
                      width: `${Math.min((totalRevenue / 150000000) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((totalRevenue / 150000000) * 100).toFixed(1)}% achieved
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200 mt-4">
                <p className="text-xs text-yellow-800">
                  💡 Tip: Maintain consistent daily performance to achieve monthly targets
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <p className="text-sm text-blue-900 font-semibold mb-2">💡 About Revenue Tracking:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Real-time revenue monitoring across all POS transactions</li>
          <li>• Track growth rate and compare period-over-period performance</li>
          <li>• Monitor high-value transactions and daily revenue patterns</li>
          <li>• Set and track revenue goals for daily and monthly targets</li>
          <li>• Filter by outlet to analyze location-specific performance</li>
        </ul>
      </div>
    </div>
  )
}
