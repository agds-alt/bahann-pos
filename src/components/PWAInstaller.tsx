'use client'

import { useEffect } from 'react'
import type { BeforeInstallPromptEvent } from '@/types'
import { logger } from '@/lib/logger'

export function PWAInstaller() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            logger.success('Service Worker registered successfully', { scope: registration.scope })
          })
          .catch((error) => {
            logger.error('Service Worker registration failed', error)
          })
      })
    }

    // Handle PWA install prompt
    let deferredPrompt: BeforeInstallPromptEvent | null = null

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      deferredPrompt = e as BeforeInstallPromptEvent
      logger.info('PWA install prompt available')

      // You can show your custom install button here
      // For now, we'll just log it
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Detect if app was successfully installed
    const handleAppInstalled = () => {
      logger.success('PWA installed successfully')
      deferredPrompt = null
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  return null
}
