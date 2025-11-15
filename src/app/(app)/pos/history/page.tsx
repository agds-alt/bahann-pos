'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'

export default function SalesHistoryPage() {
  const [dateRange, setDateRange] = useState<7 | 14 | 30>(7)
  const [selectedOutletId, setSelectedOutletId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch outlets for filter
  const { data: outletsResponse } = trpc.outlets.getAll.useQuery()
  const outlets = outletsResponse?.outlets || []

  // Fetch sales data
  const { data: salesTrend } = trpc.dashboard.getSalesTrend.useQuery({
    outletId: selectedOutletId || undefined,
    days: dateRange,
  })

  const { data: recentTransactions } = trpc.dashboard.getRecentTransactions.useQuery({
    outletId: selectedOutletId || undefined,
    limit: 50,
  })

  const { data: stats } = trpc.dashboard.getStats.useQuery({
    outletId: selectedOutletId || undefined,
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  // Filter transactions by search query
  const filteredTransactions = recentTransactions?.filter(transaction => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      transaction.productName.toLowerCase().includes(query) ||
      transaction.outletName.toLowerCase().includes(query) ||
      transaction.productSku?.toLowerCase().includes(query) ||
      transaction.transactionId?.toLowerCase().includes(query) ||
      transaction.cashierName?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Sales History</h1>
        <p className="text-gray-600">View and analyze all sales transactions</p>
      </div>

      {/* Filters */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <Input
              type="text"
              label="Search"
              placeholder="Transaction ID, product, SKU, outlet, cashier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />
          </div>
        </CardBody>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats?.totalRevenue || 0)}
            </p>
            <p className="text-sm text-green-600">{dateRange} days</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Transactions</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.transactionCount || 0}
            </p>
            <p className="text-sm text-gray-600">Total sales</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Items Sold</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.totalItemsSold.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-600">Units</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Avg Transaction</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(
                stats?.transactionCount && stats.transactionCount > 0
                  ? stats.totalRevenue / stats.transactionCount
                  : 0
              )}
            </p>
            <p className="text-sm text-gray-600">Per sale</p>
          </div>
        </Card>
      </div>

      {/* Daily Revenue Breakdown */}
      {salesTrend && salesTrend.length > 0 && (
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Daily Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Items Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {salesTrend.map((day, index) => (
                    <tr
                      key={day.date}
                      className={`border-b border-gray-100 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {formatDate(day.date)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        {formatCurrency(day.revenue)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {day.itemsSold.toLocaleString()} units
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-900 text-white font-bold">
                    <td className="py-4 px-4">Total</td>
                    <td className="py-4 px-4 text-right">
                      {formatCurrency(
                        salesTrend.reduce((sum, day) => sum + day.revenue, 0)
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {salesTrend
                        .reduce((sum, day) => sum + day.itemsSold, 0)
                        .toLocaleString()}{' '}
                      units
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Transaction List */}
      <Card variant="default" padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Transactions</CardTitle>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
              {filteredTransactions?.length || 0} transactions
            </span>
          </div>
        </CardHeader>
        <CardBody>
          {!filteredTransactions || filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <div className="text-6xl mb-4">📜</div>
              <p className="font-semibold">No transactions found</p>
              <p className="text-sm">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'No sales have been recorded yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Transaction ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date & Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Outlet</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantity</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <tr
                      key={transaction.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="py-4 px-4">
                        <p className="text-xs font-mono text-gray-600">
                          {transaction.transactionId || 'N/A'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDateTime(transaction.date)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-gray-900">{transaction.productName}</p>
                        {transaction.productSku && (
                          <p className="text-xs text-gray-500 font-mono">
                            SKU: {transaction.productSku}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-700">{transaction.outletName}</p>
                        {transaction.cashierName && (
                          <p className="text-xs text-gray-500">
                            Cashier: {transaction.cashierName}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'voided' ? 'bg-red-100 text-red-800' :
                          transaction.status === 'refunded' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.status === 'completed' ? '✓ Completed' :
                           transaction.status === 'voided' ? '✕ Voided' :
                           transaction.status === 'refunded' ? '↩ Refunded' :
                           transaction.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 font-semibold rounded-full text-sm">
                          {transaction.quantity} units
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="font-bold text-green-600">
                          {formatCurrency(transaction.revenue)}
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

      {/* Export Options */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-4">
            <Button variant="secondary" disabled>
              📊 Export to CSV
            </Button>
            <Button variant="secondary" disabled>
              📄 Export to PDF
            </Button>
            <Button variant="secondary" disabled>
              📧 Email Report
            </Button>
            <p className="text-sm text-gray-500 ml-auto">
              Export functionality coming soon
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
