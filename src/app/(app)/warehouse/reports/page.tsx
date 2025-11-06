'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function ReportsPage() {
  const [selectedOutletId, setSelectedOutletId] = useState('')
  const [dateRange, setDateRange] = useState<7 | 14 | 30>(30)

  // Fetch data
  const { data: outlets } = trpc.outlets.getAll.useQuery()
  const { data: stats } = trpc.dashboard.getStats.useQuery({
    outletId: selectedOutletId || undefined,
  })
  const { data: salesTrend } = trpc.dashboard.getSalesTrend.useQuery({
    outletId: selectedOutletId || undefined,
    days: dateRange,
  })
  const { data: topProducts } = trpc.dashboard.getTopProducts.useQuery({
    outletId: selectedOutletId || undefined,
    days: dateRange,
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

  const COLORS = ['#2563eb', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

  // Calculate metrics
  const averageDailyRevenue = salesTrend && salesTrend.length > 0
    ? salesTrend.reduce((sum, day) => sum + day.revenue, 0) / salesTrend.length
    : 0

  const averageItemsPerDay = salesTrend && salesTrend.length > 0
    ? salesTrend.reduce((sum, day) => sum + day.itemsSold, 0) / salesTrend.length
    : 0

  const highestRevenue = salesTrend && salesTrend.length > 0
    ? Math.max(...salesTrend.map(day => day.revenue))
    : 0

  const lowestRevenue = salesTrend && salesTrend.length > 0
    ? Math.min(...salesTrend.map(day => day.revenue))
    : 0

  // Prepare data for pie chart
  const pieData = topProducts?.map((product, index) => ({
    name: product.productName,
    value: product.totalRevenue,
    color: COLORS[index % COLORS.length],
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Financial Reports</h1>
        <p className="text-gray-600">Comprehensive revenue and sales analytics</p>
      </div>

      {/* Filters */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(stats?.totalRevenue || 0)}
            </p>
            <p className="text-sm text-gray-600">{dateRange} days</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Avg Daily Revenue</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(averageDailyRevenue)}
            </p>
            <p className="text-sm text-gray-600">Per day</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Total Transactions</p>
            <p className="text-3xl font-bold text-purple-600">
              {stats?.transactionCount || 0}
            </p>
            <p className="text-sm text-gray-600">Completed sales</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Avg Items/Day</p>
            <p className="text-3xl font-bold text-orange-600">
              {Math.round(averageItemsPerDay)}
            </p>
            <p className="text-sm text-gray-600">Units sold</p>
          </div>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>📈 Revenue Trend</CardTitle>
        </CardHeader>
        <CardBody>
          {salesTrend && salesTrend.length > 0 ? (
            <div className="h-80">
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
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No revenue data available for the selected period
            </div>
          )}
        </CardBody>
      </Card>

      {/* Items Sold Trend */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>📦 Items Sold Trend</CardTitle>
        </CardHeader>
        <CardBody>
          {salesTrend && salesTrend.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip labelFormatter={formatDate} />
                  <Legend />
                  <Bar
                    dataKey="itemsSold"
                    name="Items Sold"
                    fill="#2563eb"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No sales data available
            </div>
          )}
        </CardBody>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Revenue */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>🏆 Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardBody>
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => {
                  const percentage = stats?.totalRevenue
                    ? (product.totalRevenue / stats.totalRevenue) * 100
                    : 0

                  return (
                    <div key={product.productId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm`}
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{product.productName}</p>
                            <p className="text-xs text-gray-500">
                              {product.totalQuantity} units • SKU: {product.productSku}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatCurrency(product.totalRevenue)}
                          </p>
                          <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                No sales data available
              </div>
            )}
          </CardBody>
        </Card>

        {/* Revenue Distribution Pie Chart */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>📊 Revenue Distribution</CardTitle>
          </CardHeader>
          <CardBody>
            {pieData && pieData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => {
                        const { name, percent } = props
                        return `${name}: ${(percent * 100).toFixed(0)}%`
                      }}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No revenue distribution data
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card variant="default" padding="lg">
        <CardHeader>
          <CardTitle>📉 Performance Metrics</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <p className="text-sm text-green-700 font-semibold mb-2">Highest Daily Revenue</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(highestRevenue)}
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
              <p className="text-sm text-red-700 font-semibold mb-2">Lowest Daily Revenue</p>
              <p className="text-2xl font-bold text-red-900">
                {formatCurrency(lowestRevenue)}
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <p className="text-sm text-blue-700 font-semibold mb-2">Avg Transaction Value</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(
                  stats?.transactionCount && stats.transactionCount > 0
                    ? stats.totalRevenue / stats.transactionCount
                    : 0
                )}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
              <p className="text-sm text-purple-700 font-semibold mb-2">Total Items Sold</p>
              <p className="text-2xl font-bold text-purple-900">
                {stats?.totalItemsSold.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <p className="text-sm text-blue-900 font-semibold mb-2">💡 About Financial Reports:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Track revenue trends and sales performance over time</li>
          <li>• Analyze top-performing products and their contribution to total revenue</li>
          <li>• Monitor daily performance metrics and identify peak sales periods</li>
          <li>• Filter by outlet and time period for detailed location-specific insights</li>
          <li>• Use data to make informed decisions about inventory and pricing</li>
        </ul>
      </div>
    </div>
  )
}
