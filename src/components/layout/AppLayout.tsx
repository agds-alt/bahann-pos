'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { OfflineIndicator } from '@/components/OfflineIndicator'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="min-h-full p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12">
          {children}
        </div>
      </main>

      {/* Offline Indicator - shows network status and pending syncs */}
      <OfflineIndicator />
    </div>
  )
}
