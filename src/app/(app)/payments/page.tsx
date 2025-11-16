'use client'

import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments Management</h1>
        <p className="text-gray-600">Manage and confirm pending payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Pending QRIS</p>
            <p className="text-3xl font-bold text-yellow-600">0</p>
            <p className="text-sm text-gray-600">Waiting confirmation</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Pending Bank Transfer</p>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-600">Waiting confirmation</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500">Today's Payments</p>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-600">Confirmed today</p>
          </div>
        </Card>
      </div>

      {/* Pending Payments */}
      <Card variant="elevated" padding="md">
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Management Coming Soon
            </h3>
            <p className="text-gray-600 mb-6">
              Payment system is ready. Integration with POS will be available soon.
            </p>
            <Button variant="primary" onClick={() => window.location.href = '/pos/sales'}>
              Go to POS Sales
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Quick Info */}
      <Card variant="default" padding="lg">
        <CardHeader>
          <CardTitle>Payment Methods Available</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl mb-2">💵</div>
              <p className="text-sm font-semibold">Cash</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl mb-2">📱</div>
              <p className="text-sm font-semibold">QRIS</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl mb-2">🏦</div>
              <p className="text-sm font-semibold">Bank Transfer</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl mb-2">💳</div>
              <p className="text-sm font-semibold">Debit Card</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl mb-2">💳</div>
              <p className="text-sm font-semibold">Credit Card</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
