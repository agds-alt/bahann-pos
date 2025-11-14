'use client'

import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'

export default function AlertsPage() {
  const { data: alerts, refetch } = trpc.stockAlerts.getActive.useQuery({})
  const { data: summary } = trpc.stockAlerts.getSummary.useQuery({})
  const acknowledgeMutation = trpc.stockAlerts.acknowledge.useMutation({ onSuccess: () => refetch() })
  const generateMutation = trpc.stockAlerts.generate.useMutation({ onSuccess: () => refetch() })

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeMutation.mutateAsync({ alertId })
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to acknowledge alert')
    }
  }

  const handleGenerateAlerts = async () => {
    try {
      const result = await generateMutation.mutateAsync()
      alert(`Generated ${result.alertsGenerated} new alerts`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate alerts')
    }
  }

  const getAlertColor = (type: string) => {
    if (type === 'out_of_stock') return 'bg-red-100 text-red-800 border-red-200'
    if (type === 'low_stock') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Stock Alerts</h1>
          <p className="text-gray-600">Monitor low stock and inventory alerts</p>
        </div>
        <Button variant="primary" onClick={handleGenerateAlerts} disabled={generateMutation.isPending}>
          {generateMutation.isPending ? 'Generating...' : 'Generate Alerts'}
        </Button>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <Card variant="elevated" padding="lg">
            <p className="text-sm text-gray-600">Out of Stock</p>
            <p className="text-3xl font-bold text-red-600">{summary.outOfStock}</p>
          </Card>
          <Card variant="elevated" padding="lg">
            <p className="text-sm text-gray-600">Low Stock</p>
            <p className="text-3xl font-bold text-yellow-600">{summary.lowStock}</p>
          </Card>
          <Card variant="elevated" padding="lg">
            <p className="text-sm text-gray-600">Total Alerts</p>
            <p className="text-3xl font-bold text-blue-600">{summary.total}</p>
          </Card>
        </div>
      )}

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Active Alerts</CardTitle></CardHeader>
        <CardBody>
          <div className="space-y-3">
            {alerts?.map((alert) => (
              <div key={alert.id} className={`flex items-center justify-between p-4 rounded-xl border-2 ${getAlertColor(alert.alert_type)}`}>
                <div>
                  <p className="font-bold">{alert.product?.name}</p>
                  <p className="text-sm">{alert.outlet?.name}</p>
                  <p className="text-xs mt-1">
                    Current stock: <strong>{alert.current_stock}</strong> | Reorder point: {alert.reorder_point}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-semibold mb-2">
                    {alert.alert_type.replace('_', ' ').toUpperCase()}
                  </span>
                  <Button size="sm" onClick={() => handleAcknowledge(alert.id)} disabled={acknowledgeMutation.isPending}>
                    Acknowledge
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
