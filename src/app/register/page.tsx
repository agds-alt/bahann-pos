'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { trpc } from '@/lib/trpc/client'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    outletId: '',
    role: 'user',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const registerMutation = trpc.auth.register.useMutation()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const result = await registerMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        outletId: formData.outletId || undefined,
        role: formData.role,
      })

      setSuccess(true)

      // Show success message then redirect
      setTimeout(() => {
        router.push('/login?registered=true')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bahann POS</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        {/* Register Card */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Register New User</CardTitle>
          </CardHeader>

          <CardBody>
            {success ? (
              <div className="text-center py-8">
                <div className="mb-4 text-6xl">✅</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  Registration Successful!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your account has been created successfully.
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to login page...
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-sm font-semibold text-red-600">❌ {error}</p>
                  </div>
                )}

                <Input
                  type="text"
                  name="name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                />

                <Input
                  type="email"
                  name="email"
                  label="Email Address"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  required
                />

                <Input
                  type="password"
                  name="password"
                  label="Password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  required
                />

                <Input
                  type="password"
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  fullWidth
                  required
                />

                <Select
                  name="role"
                  label="Role"
                  value={formData.role}
                  onChange={handleChange}
                  options={[
                    { value: 'user', label: 'User (Cashier)' },
                    { value: 'manager', label: 'Manager' },
                    { value: 'admin', label: 'Administrator' },
                  ]}
                  fullWidth
                />

                <Input
                  type="text"
                  name="outletId"
                  label="Outlet ID (Optional)"
                  placeholder="Enter outlet UUID (leave empty if none)"
                  value={formData.outletId}
                  onChange={handleChange}
                  fullWidth
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : '✨ Create Account'}
                  </Button>
                </div>

                <div className="pt-2 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="/login" className="font-semibold text-gray-900 hover:underline">
                      Login here
                    </a>
                  </p>
                </div>

                <div className="pt-4 text-center">
                  <a
                    href="/test/users"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    🔍 View Registered Users (Test)
                  </a>
                </div>
              </form>
            )}
          </CardBody>
        </Card>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <p className="text-sm text-blue-900 font-semibold mb-2">ℹ️ Test Account Info:</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Password must be at least 8 characters</li>
            <li>• Email must be unique (not already registered)</li>
            <li>• Outlet ID is optional (can leave empty)</li>
            <li>• Choose role based on access level needed</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
