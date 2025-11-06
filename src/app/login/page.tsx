'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { trpc } from '@/lib/trpc/client'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showRegisteredMessage, setShowRegisteredMessage] = useState(false)

  useEffect(() => {
    // Check if redirected from registration
    if (searchParams.get('registered') === 'true') {
      setShowRegisteredMessage(true)
      // Hide message after 5 seconds
      setTimeout(() => setShowRegisteredMessage(false), 5000)
    }
  }, [searchParams])

  const loginMutation = trpc.auth.login.useMutation()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await loginMutation.mutateAsync({
        email,
        password,
      })

      // Store token in localStorage
      localStorage.setItem('auth_token', result.token)

      // Store user data
      localStorage.setItem('user', JSON.stringify(result.user))

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
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
          <p className="text-gray-600">Warehouse & Point of Sale System</p>
        </div>

        {/* Login Card */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleLogin} className="space-y-6">
              {showRegisteredMessage && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <p className="text-sm font-semibold text-green-600">
                    ✅ Registration successful! Please login with your credentials.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/register" className="font-semibold text-gray-900 hover:underline">
                  Register
                </a>
              </p>
              <p className="text-xs text-gray-500">
                <a href="/test/users" className="text-blue-600 hover:underline">
                  🔍 View Registered Users (Test)
                </a>
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Session valid for 7 days
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
