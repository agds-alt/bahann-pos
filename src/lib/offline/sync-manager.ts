/**
 * Offline Sync Manager
 *
 * Handles syncing offline data when connection is restored.
 * Auto-syncs every 30 seconds when online.
 */

import { offlineDb, type OfflineTransaction } from './database'

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

export class SyncManager {
  private syncInProgress = false
  private syncInterval: NodeJS.Timeout | null = null
  private onlineListener: (() => void) | null = null
  private offlineListener: (() => void) | null = null
  private statusListeners: Set<(status: SyncStatus) => void> = new Set()

  /**
   * Start the sync manager
   */
  start() {
    if (typeof window === 'undefined') return

    // Listen for network status changes
    this.onlineListener = () => {
      console.log('📡 Network restored - starting sync')
      this.notifyStatus('idle')
      this.syncAll()
    }

    this.offlineListener = () => {
      console.log('📡 Network lost - entering offline mode')
      this.notifyStatus('idle')
    }

    window.addEventListener('online', this.onlineListener)
    window.addEventListener('offline', this.offlineListener)

    // Periodic sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.syncAll()
      }
    }, 30000)

    // Initial sync if online
    if (navigator.onLine) {
      setTimeout(() => this.syncAll(), 2000) // Delay 2s after init
    }

    console.log('✅ Sync manager started')
  }

  /**
   * Stop the sync manager
   */
  stop() {
    if (this.onlineListener) {
      window.removeEventListener('online', this.onlineListener)
    }
    if (this.offlineListener) {
      window.removeEventListener('offline', this.offlineListener)
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    console.log('🛑 Sync manager stopped')
  }

  /**
   * Add status listener
   */
  onStatusChange(listener: (status: SyncStatus) => void) {
    this.statusListeners.add(listener)
    return () => this.statusListeners.delete(listener)
  }

  /**
   * Notify all listeners
   */
  private notifyStatus(status: SyncStatus) {
    this.statusListeners.forEach(listener => listener(status))
  }

  /**
   * Sync all pending data
   */
  async syncAll() {
    if (this.syncInProgress || !navigator.onLine) {
      return
    }

    this.syncInProgress = true
    this.notifyStatus('syncing')

    console.log('🔄 Starting sync...')

    try {
      // 1. Sync pending transactions (highest priority)
      const syncedTransactions = await this.syncTransactions()

      // 2. Sync queue items
      const syncedQueue = await this.syncQueue()

      // 3. Pull latest product data (if needed)
      await this.pullProducts()

      // 4. Cleanup old data
      await offlineDb.cleanup()

      console.log(`✅ Sync completed: ${syncedTransactions} transactions, ${syncedQueue} queue items`)
      this.notifyStatus('success')

      // Dispatch event for UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sync-completed', {
          detail: {
            transactions: syncedTransactions,
            queueItems: syncedQueue
          }
        }))
      }
    } catch (error) {
      console.error('❌ Sync failed:', error)
      this.notifyStatus('error')
    } finally {
      this.syncInProgress = false

      // Auto-reset to idle after 3 seconds
      setTimeout(() => {
        if (!this.syncInProgress) {
          this.notifyStatus('idle')
        }
      }, 3000)
    }
  }

  /**
   * Sync offline transactions
   */
  private async syncTransactions(): Promise<number> {
    const pendingTransactions = await offlineDb.transactions
      .where('synced')
      .equals(0) // 0 = false in IndexedDB
      .filter(tx => tx.syncAttempts < 5) // Max 5 attempts
      .toArray()

    let syncedCount = 0

    for (const transaction of pendingTransactions) {
      try {
        // Call tRPC endpoint to save transaction
        const response = await fetch('/api/trpc/sales.recordOffline', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(transaction)
        })

        if (response.ok) {
          // Mark as synced
          await offlineDb.transactions.update(transaction.id!, {
            synced: true,
            syncError: undefined,
            syncAttempts: transaction.syncAttempts + 1
          })
          syncedCount++
          console.log(`✅ Synced transaction: ${transaction.transactionId}`)
        } else {
          const error = await response.text()
          throw new Error(`HTTP ${response.status}: ${error}`)
        }
      } catch (error: any) {
        // Increment attempts and log error
        await offlineDb.transactions.update(transaction.id!, {
          syncError: error.message,
          syncAttempts: transaction.syncAttempts + 1
        })
        console.error(`❌ Failed to sync transaction ${transaction.transactionId}:`, error.message)
      }
    }

    return syncedCount
  }

  /**
   * Sync queue items
   */
  private async syncQueue(): Promise<number> {
    const queueItems = await offlineDb.syncQueue
      .where('attempts')
      .below(5)
      .toArray()

    let syncedCount = 0

    for (const item of queueItems) {
      // Skip if recently attempted (< 1 minute ago)
      if (item.lastAttempt && Date.now() - item.lastAttempt < 60000) {
        continue
      }

      try {
        const response = await fetch(item.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(item.data)
        })

        if (response.ok) {
          await offlineDb.syncQueue.delete(item.id!)
          syncedCount++
          console.log(`✅ Synced queue item: ${item.type}`)
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error: any) {
        await offlineDb.syncQueue.update(item.id!, {
          attempts: item.attempts + 1,
          lastAttempt: Date.now(),
          error: error.message
        })
        console.error(`❌ Failed to sync queue item ${item.id}:`, error.message)
      }
    }

    return syncedCount
  }

  /**
   * Pull latest product data
   */
  private async pullProducts() {
    try {
      // Only pull if no products cached or very old
      const productCount = await offlineDb.products.count()
      if (productCount > 0) {
        const oldestProduct = await offlineDb.products.orderBy('lastSync').first()
        const hoursSinceSync = oldestProduct
          ? (Date.now() - oldestProduct.lastSync) / (1000 * 60 * 60)
          : 999

        // Skip if synced within last 6 hours
        if (hoursSinceSync < 6) {
          return
        }
      }

      console.log('📥 Pulling latest products...')
      const response = await fetch('/api/trpc/products.getAllForOffline')

      if (response.ok) {
        const data = await response.json()
        const products = data.result?.data?.products || []

        if (products.length > 0) {
          // Update local database
          await offlineDb.products.bulkPut(
            products.map((p: any) => ({
              id: p.id,
              name: p.name,
              sku: p.sku,
              price: p.price,
              category: p.category,
              barcode: p.barcode,
              stock: p.stock || 0,
              outletId: p.outletId,
              lastSync: Date.now()
            }))
          )
          console.log(`✅ Pulled ${products.length} products`)
        }
      }
    } catch (error) {
      console.error('❌ Failed to pull products:', error)
      // Non-critical, don't throw
    }
  }

  /**
   * Force sync now
   */
  forceSync() {
    console.log('🔄 Force sync triggered')
    return this.syncAll()
  }

  /**
   * Get sync status
   */
  getStatus(): SyncStatus {
    if (this.syncInProgress) return 'syncing'
    return 'idle'
  }
}

// Singleton instance
export const syncManager = new SyncManager()

// Auto-start in browser
if (typeof window !== 'undefined') {
  // Start after page load
  if (document.readyState === 'complete') {
    syncManager.start()
  } else {
    window.addEventListener('load', () => syncManager.start())
  }
}
