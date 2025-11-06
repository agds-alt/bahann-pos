'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

interface SidebarItemProps {
  href: string
  icon: ReactNode
  label: string
  badge?: string
}

function SidebarItem({ href, icon, label, badge }: SidebarItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-4 px-6 py-4 rounded-xl
        transition-all duration-200
        ${
          isActive
            ? 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] border-2 border-gray-200 translate-x-2'
            : 'hover:bg-white/50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] hover:translate-x-1'
        }
      `}
    >
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <span className={`text-base font-semibold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
          {label}
        </span>
      </div>
      {badge && (
        <span className="px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
          {badge}
        </span>
      )}
    </Link>
  )
}

interface SidebarSectionProps {
  title: string
  children: ReactNode
}

function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="mb-8">
      <h3 className="px-6 mb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}

export function Sidebar() {
  const router = useRouter()
  const [userName, setUserName] = useState('User')
  const [userEmail, setUserEmail] = useState('')
  const [userRole, setUserRole] = useState('user')

  useEffect(() => {
    // Get user data from localStorage
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user')
      if (user) {
        try {
          const userData = JSON.parse(user)
          setUserName(userData.name || 'User')
          setUserEmail(userData.email || '')
          setUserRole(userData.role || 'user')
        } catch (error) {
          console.error('Failed to parse user data:', error)
        }
      }
    }
  }, [])

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      // Clear localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')

      // Redirect to login
      router.push('/login')
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin', color: 'bg-red-100 text-red-800' }
      case 'manager':
        return { label: 'Manager', color: 'bg-yellow-100 text-yellow-800' }
      default:
        return { label: 'User', color: 'bg-green-100 text-green-800' }
    }
  }

  const roleBadge = getRoleBadge(userRole)
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <aside className="w-80 h-screen bg-gray-50 border-r-2 border-gray-200 flex flex-col overflow-y-auto">
      {/* Logo/Header */}
      <div className="p-6 border-b-2 border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Bahann POS</h1>
        <p className="text-sm text-gray-500 mt-1">Warehouse & Point of Sale</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <SidebarSection title="Dashboard">
          <SidebarItem
            href="/dashboard"
            icon="📊"
            label="Overview"
          />
        </SidebarSection>

        <SidebarSection title="Warehouse">
          <SidebarItem
            href="/warehouse/stock"
            icon="📦"
            label="Stock Management"
          />
          <SidebarItem
            href="/warehouse/inventory"
            icon="📋"
            label="Inventory Monitor"
          />
          <SidebarItem
            href="/warehouse/reports"
            icon="📈"
            label="Reports"
          />
        </SidebarSection>

        <SidebarSection title="Point of Sale">
          <SidebarItem
            href="/pos/sales"
            icon="🛒"
            label="Sales Transaction"
          />
          <SidebarItem
            href="/pos/history"
            icon="📜"
            label="Sales History"
          />
          <SidebarItem
            href="/pos/revenue"
            icon="💰"
            label="Revenue Tracking"
          />
        </SidebarSection>

        <SidebarSection title="Master Data">
          <SidebarItem
            href="/products"
            icon="🏷️"
            label="Products"
          />
          <SidebarItem
            href="/outlets"
            icon="🏪"
            label="Outlets"
          />
        </SidebarSection>

        <SidebarSection title="Account">
          <SidebarItem
            href="/profile"
            icon="👤"
            label="Profile"
          />
          <SidebarItem
            href="/about"
            icon="ℹ️"
            label="About"
          />
        </SidebarSection>
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t-2 border-gray-200 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleBadge.color}`}>
            {roleBadge.label}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
