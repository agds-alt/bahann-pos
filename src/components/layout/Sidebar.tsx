'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

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
            href="/logout"
            icon="🚪"
            label="Logout"
          />
        </SidebarSection>
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t-2 border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">John Doe</p>
            <p className="text-xs text-gray-500 truncate">OTISTA Outlet</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
