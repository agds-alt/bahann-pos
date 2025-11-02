'use client'

import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your warehouse and sales performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">1,234</p>
            <p className="text-sm text-green-600">+12% from last month</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">Rp 45.2M</p>
            <p className="text-sm text-green-600">+8% from last month</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Low Stock Items</p>
            <p className="text-3xl font-bold text-gray-900">23</p>
            <p className="text-sm text-red-600">Needs attention</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Active Outlets</p>
            <p className="text-3xl font-bold text-gray-900">5</p>
            <p className="text-sm text-gray-600">All operational</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="primary" size="lg">
              📦 Record Stock
            </Button>
            <Button variant="primary" size="lg">
              🛒 New Sale
            </Button>
            <Button variant="secondary" size="lg">
              📊 View Reports
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Recent Stock Movements</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-semibold text-gray-900">Product {i}</p>
                    <p className="text-sm text-gray-500">OTISTA • Today at 10:30 AM</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+50 units</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-semibold text-gray-900">Sale #{1000 + i}</p>
                    <p className="text-sm text-gray-500">OTISTA • Today at 11:45 AM</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">Rp 250,000</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
