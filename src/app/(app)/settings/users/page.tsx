'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'

export default function UsersManagementPage() {
  const { data: users, refetch } = trpc.users.list.useQuery()
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<any>({})

  const updateMutation = trpc.users.updatePermissions.useMutation({
    onSuccess: () => {
      refetch()
      setEditingUser(null)
    },
  })

  const handleSave = async (userId: string) => {
    try {
      await updateMutation.mutateAsync({ userId, permissions })
      alert('Permissions updated successfully')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update permissions')
    }
  }

  const handleEdit = (user: any) => {
    setEditingUser(user.id)
    setPermissions(user.permissions || {})
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage user roles and permissions</p>
      </div>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Users</CardTitle></CardHeader>
        <CardBody>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Email</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Role</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users?.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {user.role?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                      Edit Permissions
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card variant="elevated" padding="lg" className="max-w-2xl w-full max-h-screen overflow-y-auto">
            <CardHeader><CardTitle>Edit Permissions</CardTitle></CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'canVoidTransactions', label: 'Void Transactions' },
                  { key: 'canGiveDiscount', label: 'Give Discount' },
                  { key: 'canCloseDay', label: 'Close Day (EOD)' },
                  { key: 'canManageUsers', label: 'Manage Users' },
                  { key: 'canEditPrices', label: 'Edit Prices' },
                  { key: 'canManagePromotions', label: 'Manage Promotions' },
                  { key: 'canViewReports', label: 'View Reports' },
                  { key: 'canManageInventory', label: 'Manage Inventory' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!!permissions[key]}
                      onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-2">Max Discount %</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={permissions.maxDiscountPercent || 0}
                  onChange={(e) => setPermissions({ ...permissions, maxDiscountPercent: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="primary" onClick={() => handleSave(editingUser)} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
