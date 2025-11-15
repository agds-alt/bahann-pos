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
    // Token is stored in httpOnly cookie, check user data presence
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
    }
  }, [router])

  return <AppLayout>{children}</AppLayout>
}
