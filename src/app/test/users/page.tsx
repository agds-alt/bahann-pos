'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { useRouter } from 'next/navigation'

export default function TestUsersPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading, error, refetch } = trpc.auth.getAllUsers.useQuery({
    page,
    limit: 20,
    search: search || undefined,
  })

  const users = data?.users || []
  const pagination = data?.pagination

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                👥 Registered Users (Test)
              </h1>
              <p className="text-gray-600">
                View all registered users in the database
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => refetch()}>
                🔄 Refresh
              </Button>
              <Button variant="primary" onClick={() => router.push('/register')}>
                ➕ Add User
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push('/login')}>
              🔐 Login
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              📊 Dashboard
            </Button>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-900 font-semibold">
            ⚠️ This page is for testing purposes only. In production, user data should be protected.
          </p>
          <p className="text-xs text-yellow-800 mt-1">
            🔒 This page now requires ADMIN role to access.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1) // Reset to page 1 on search
            }}
            fullWidth
          />
        </div>

        {/* Users List */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>
              All Users {pagination && `(${pagination.total} total, page ${pagination.page}/${pagination.totalPages})`}
            </CardTitle>
          </CardHeader>

          <CardBody>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900"></div>
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-xl font-bold text-red-600 mb-2">Error Loading Users</h3>
                <p className="text-gray-600 mb-4">{error.message}</p>
                <Button variant="primary" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            ) : !users || users.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Users Found</h3>
                <p className="text-gray-600 mb-4">
                  No users have been registered yet. Create a new account to get started.
                </p>
                <Button variant="primary" onClick={() => router.push('/register')}>
                  Register New User
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Outlet ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`
                          border-b border-gray-100 hover:bg-gray-50 transition-colors
                          ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        `}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500 font-mono">{user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-900">{user.email}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`
                              inline-block px-3 py-1 rounded-full text-xs font-semibold
                              ${
                                user.role === 'admin'
                                  ? 'bg-red-100 text-red-800'
                                  : user.role === 'manager'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }
                            `}
                          >
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {user.outlet_id ? (
                            <p className="text-sm font-mono text-gray-600">
                              {user.outlet_id.substring(0, 8)}...
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400 italic">None</p>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-600">
                            {formatDate(user.created_at || '')}
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

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              ← Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= pagination.totalPages || isLoading}
            >
              Next →
            </Button>
          </div>
        )}

        {/* Stats Card */}
        {users && users.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="default" padding="lg">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{pagination?.total || 0}</p>
              </div>
            </Card>

            <Card variant="default" padding="lg">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Admins</p>
                <p className="text-3xl font-bold text-red-600">
                  {users.filter((u) => u.role === 'admin').length}
                </p>
              </div>
            </Card>

            <Card variant="default" padding="lg">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Users with Outlet</p>
                <p className="text-3xl font-bold text-blue-600">
                  {users.filter((u) => u.outlet_id).length}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <p className="text-sm text-blue-900 font-semibold mb-2">ℹ️ Database Info:</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Users table stores authentication credentials (password hashed with bcrypt)</li>
            <li>• Email must be unique per user</li>
            <li>• Outlet ID is optional and links user to specific outlet</li>
            <li>• Passwords are not displayed for security reasons</li>
            <li>• This page uses tRPC query: `trpc.auth.getAllUsers.useQuery()`</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
