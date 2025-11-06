'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')

      if (token) {
        // Redirect to dashboard if already logged in
        router.push('/dashboard')
      } else {
        // Redirect to login page
        router.push('/login')
      }
    }
  }, [router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-gray-900 mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AGDS Corp POS</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
