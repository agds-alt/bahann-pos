'use client'

import { useEffect } from 'react'

export function PWAInstaller() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker registered successfully:', registration.scope)
          })
          .catch((error) => {
            console.error('❌ Service Worker registration failed:', error)
          })
      })
    }

    // Handle PWA install prompt
    let deferredPrompt: any = null

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      deferredPrompt = e
      console.log('💡 PWA install prompt available')

      // You can show your custom install button here
      // For now, we'll just log it
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Detect if app was successfully installed
    const handleAppInstalled = () => {
      console.log('✅ PWA installed successfully')
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
