'use client'

import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { trpc } from '@/lib/trpc/client'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    whatsappNumber: '',
  })

  const { data: profile, isLoading, refetch } = trpc.auth.getProfile.useQuery()
  const updateProfile = trpc.auth.updateProfile.useMutation()

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        whatsappNumber: profile.whatsappNumber,
      })
    }
  }, [profile])

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(formData)
      await refetch()
      setIsEditing(false)
      showToast('Profil berhasil diperbarui!', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menyimpan profil', 'error')
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({ name: profile.name, whatsappNumber: profile.whatsappNumber })
    }
    setIsEditing(false)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrator', color: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300', icon: '👑' }
      case 'manager':
        return { label: 'Manager', color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300', icon: '⭐' }
      default:
        return { label: 'User (Cashier)', color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300', icon: '👤' }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 dark:border-gray-600 border-t-gray-900 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const roleBadge = getRoleBadge(profile.role)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">User Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account settings and information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <Card variant="elevated" padding="lg">
          <CardBody>
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {profile.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
                {profile.whatsappNumber && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{profile.whatsappNumber}</p>
                )}
              </div>

              <div className="flex justify-center">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${roleBadge.color}`}>
                  {roleBadge.icon} {roleBadge.label}
                </span>
              </div>

              <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">User ID</p>
                <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">{profile.id}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="default" padding="lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informasi Pribadi</CardTitle>
                {!isEditing && (
                  <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                    ✏️ Edit Profil
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody>
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    type="text"
                    label="Nama Lengkap"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    fullWidth
                    required
                  />

                  <Input
                    type="email"
                    label="Email"
                    value={profile.email}
                    fullWidth
                    disabled
                  />

                  <Input
                    type="tel"
                    label="Nomor HP / WhatsApp"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="contoh: 08123456789"
                    fullWidth
                  />

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      fullWidth
                      disabled={updateProfile.isPending}
                    >
                      {updateProfile.isPending ? 'Menyimpan...' : '✅ Simpan'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} fullWidth>
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nama Lengkap</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{profile.name}</p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{profile.email}</p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nomor HP / WhatsApp</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {profile.whatsappNumber || <span className="text-gray-400 italic text-sm">Belum diisi</span>}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Role</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{roleBadge.label}</p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Account Settings */}
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
                  <p className="text-sm text-blue-900 dark:text-blue-200 font-semibold mb-2">
                    🔐 Session Information
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    Sesi Anda berlaku selama 7 hari dan akan logout otomatis setelah itu.
                  </p>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-900 dark:text-red-200 font-semibold mb-2">
                    🚨 Danger Zone
                  </p>
                  <p className="text-xs text-red-800 dark:text-red-300 mb-3">
                    Setelah logout, Anda harus login kembali dengan kredensial Anda.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Yakin ingin logout?')) {
                        localStorage.removeItem('auth_token')
                        localStorage.removeItem('user')
                        router.push('/login')
                      }
                    }}
                  >
                    🚪 Logout
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
