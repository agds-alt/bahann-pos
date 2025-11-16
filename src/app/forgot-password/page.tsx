'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate API call (you'll need to implement the actual endpoint)
    try {
      // TODO: Implement password reset email endpoint
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess(true)
    } catch (err) {
      setError('Gagal mengirim email reset. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AGDS Corp POS</h1>
          <p className="text-gray-600">Reset Password</p>
        </div>

        {/* Forgot Password Card */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Lupa Password</CardTitle>
          </CardHeader>

          <CardBody>
            {success ? (
              <div className="text-center py-8">
                <div className="mb-4 text-6xl">📧</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  Email Terkirim!
                </h3>
                <p className="text-gray-600 mb-6">
                  Kami telah mengirimkan link reset password ke email Anda.
                  Silakan cek inbox atau folder spam.
                </p>
                <a
                  href="/login"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  ← Kembali ke Login
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-900">
                    💡 Masukkan email Anda dan kami akan mengirimkan instruksi untuk
                    mereset password.
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-sm font-semibold text-red-600">❌ {error}</p>
                  </div>
                )}

                <Input
                  type="email"
                  label="Email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  {isLoading ? 'Mengirim...' : '📧 Kirim Link Reset'}
                </Button>

                <div className="text-center">
                  <a
                    href="/login"
                    className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                  >
                    ← Kembali ke Login
                  </a>
                </div>
              </form>
            )}
          </CardBody>
        </Card>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-900 font-semibold mb-2">⚠️ Catatan:</p>
          <ul className="text-xs text-yellow-800 space-y-1">
            <li>• Jika email tidak masuk, cek folder spam</li>
            <li>• Link reset berlaku selama 1 jam</li>
            <li>• Jika masih bermasalah, hubungi administrator</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
