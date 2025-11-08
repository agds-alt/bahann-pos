'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { logger } from '@/lib/logger'

interface SidebarItemProps {
  href: string
  icon: ReactNode
  label: string
  badge?: string
  isCollapsed: boolean
}

function SidebarItem({ href, icon, label, badge, isCollapsed }: SidebarItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined}
      className={`
        flex items-center gap-4 rounded-xl
        transition-all duration-200 group relative
        ${isCollapsed ? 'px-4 py-4 justify-center' : 'px-6 py-4'}
        ${
          isActive
            ? 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] border-2 border-gray-200 translate-x-2'
            : 'hover:bg-white/50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] hover:translate-x-1'
        }
      `}
    >
      <div className="text-2xl flex-shrink-0">{icon}</div>
      {!isCollapsed && (
        <>
          <div className="flex-1 min-w-0">
            <span className={`text-base font-semibold ${isActive ? 'text-gray-900' : 'text-gray-600'} truncate block`}>
              {label}
            </span>
          </div>
          {badge && (
            <span className="px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-full flex-shrink-0">
              {badge}
            </span>
          )}
        </>
      )}
      {isCollapsed && badge && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  )
}

interface SidebarSectionProps {
  title: string
  children: ReactNode
  isCollapsed: boolean
}

function SidebarSection({ title, children, isCollapsed }: SidebarSectionProps) {
  return (
    <div className="mb-6">
      {!isCollapsed && (
        <h3 className="px-6 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      )}
      {isCollapsed && <div className="h-2" />}
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}

export function Sidebar() {
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const [userName, setUserName] = useState('User')
  const [userEmail, setUserEmail] = useState('')
  const [userRole, setUserRole] = useState('user')
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    // Get user data and sidebar state from localStorage
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user')
      if (user) {
        try {
          const userData = JSON.parse(user)
          setUserName(userData.name || 'User')
          setUserEmail(userData.email || '')
          setUserRole(userData.role || 'user')
        } catch (error) {
          logger.error('Failed to parse user data', error)
        }
      }

      // Load sidebar collapse state
      const savedCollapsed = localStorage.getItem('sidebar_collapsed')
      if (savedCollapsed !== null) {
        setIsCollapsed(savedCollapsed === 'true')
      }
    }
  }, [])

  const handleLogout = () => {
    if (confirm(t('sidebar.logout.confirm'))) {
      // Clear localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')

      // Redirect to login
      router.push('/login')
    }
  }

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id')
  }

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    localStorage.setItem('sidebar_collapsed', String(newCollapsed))
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: t('role.admin'), color: 'bg-red-100 text-red-800' }
      case 'manager':
        return { label: t('role.manager'), color: 'bg-yellow-100 text-yellow-800' }
      default:
        return { label: t('role.user'), color: 'bg-green-100 text-green-800' }
    }
  }

  const roleBadge = getRoleBadge(userRole)
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <aside className={`
      ${isCollapsed ? 'w-20' : 'w-80'}
      h-screen bg-gray-50 border-r-2 border-gray-200 flex flex-col overflow-y-auto
      transition-all duration-300 ease-in-out flex-shrink-0
    `}>
      {/* Logo/Header */}
      <div className={`border-b-2 border-gray-200 flex items-center justify-between ${isCollapsed ? 'p-4' : 'p-6'} transition-all duration-300`}>
        {!isCollapsed ? (
          <>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AGDS Corp POS</h1>
              <p className="text-sm text-gray-500 mt-1">Warehouse & Point of Sale</p>
            </div>
            <button
              onClick={toggleCollapse}
              className="ml-2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Collapse sidebar"
            >
              <span className="text-xl">◀</span>
            </button>
          </>
        ) : (
          <button
            onClick={toggleCollapse}
            className="w-full p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Expand sidebar"
          >
            <span className="text-xl">▶</span>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-3' : 'p-6'} transition-all duration-300`}>
        <SidebarSection title={t('sidebar.dashboard')} isCollapsed={isCollapsed}>
          <SidebarItem
            href="/dashboard"
            icon="📊"
            label={t('sidebar.dashboard')}
            isCollapsed={isCollapsed}
          />
        </SidebarSection>

        <SidebarSection title={t('sidebar.warehouse')} isCollapsed={isCollapsed}>
          <SidebarItem
            href="/warehouse/stock"
            icon="📦"
            label={t('sidebar.warehouse.stock')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/warehouse/inventory"
            icon="📋"
            label={t('sidebar.warehouse.inventory')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/warehouse/reports"
            icon="📈"
            label={t('sidebar.warehouse.reports')}
            isCollapsed={isCollapsed}
          />
        </SidebarSection>

        <SidebarSection title={t('sidebar.pos')} isCollapsed={isCollapsed}>
          <SidebarItem
            href="/pos/sales"
            icon="🛒"
            label={t('sidebar.pos.sales')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/pos/history"
            icon="📜"
            label={t('sidebar.pos.history')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/pos/revenue"
            icon="💰"
            label={t('sidebar.pos.revenue')}
            isCollapsed={isCollapsed}
          />
        </SidebarSection>

        <SidebarSection title="Master Data" isCollapsed={isCollapsed}>
          <SidebarItem
            href="/products"
            icon="🏷️"
            label="Products"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/outlets"
            icon="🏪"
            label="Outlets"
            isCollapsed={isCollapsed}
          />
        </SidebarSection>

        <SidebarSection title={t('sidebar.account')} isCollapsed={isCollapsed}>
          <SidebarItem
            href="/profile"
            icon="👤"
            label={t('sidebar.profile')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/about"
            icon="ℹ️"
            label={t('sidebar.about')}
            isCollapsed={isCollapsed}
          />
        </SidebarSection>
      </nav>

      {/* Footer Info */}
      <div className={`border-t-2 border-gray-200 bg-white ${isCollapsed ? 'p-3' : 'p-6'} transition-all duration-300`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="mb-3 flex items-center justify-center gap-2 p-2 bg-gray-50 rounded-lg">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 transition-all duration-200 w-full justify-center"
              >
                <span className="text-lg">{language === 'id' ? '🇮🇩' : '🇬🇧'}</span>
                <span className="text-xs font-semibold text-gray-700">
                  {language === 'id' ? 'Bahasa Indonesia' : 'English'}
                </span>
                <span className="text-xs text-gray-400">↔</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                🚪 {t('sidebar.logout')}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform"
              title={userName}
            >
              {userInitial}
            </div>

            {/* Language Toggle Icon */}
            <button
              onClick={toggleLanguage}
              className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
            >
              <span className="text-2xl">{language === 'id' ? '🇮🇩' : '🇬🇧'}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-12 h-12 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
              title={t('sidebar.logout')}
            >
              <span className="text-2xl">🚪</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
