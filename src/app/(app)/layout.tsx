'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  return <AppLayout>{children}</AppLayout>
}
