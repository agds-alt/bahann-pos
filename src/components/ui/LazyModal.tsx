/**
 * LazyModal Component
 * Modal wrapper with lazy loading support for heavy content
 *
 * Usage:
 * ```tsx
 * const HeavyForm = lazy(() => import('@/components/forms/HeavyForm'))
 *
 * <LazyModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Add Product"
 *   size="lg"
 * >
 *   <HeavyForm onSubmit={handleSubmit} />
 * </LazyModal>
 * ```
 */
'use client'

import { Suspense, ComponentType, ReactNode } from 'react'
import { Modal } from './Modal'
import { ModalLoadingSkeleton } from './Skeletons'

interface LazyModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  footer?: ReactNode
  children: ReactNode
  loadingMessage?: string
}

/**
 * LazyModal - Wraps Modal with Suspense for lazy-loaded content
 *
 * Perfect for:
 * - Heavy forms with complex validation
 * - Rich text editors
 * - Date pickers with large libraries
 * - Complex data entry forms
 * - Multi-step wizards
 */
export function LazyModal({
  isOpen,
  onClose,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  footer,
  children,
  loadingMessage = 'Loading content...',
}: LazyModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      showCloseButton={showCloseButton}
      closeOnBackdropClick={closeOnBackdropClick}
      footer={footer}
    >
      <Suspense fallback={<ModalLoadingSkeleton message={loadingMessage} />}>
        {children}
      </Suspense>
    </Modal>
  )
}

/**
 * Factory function to create lazy-loadable modal content components
 *
 * Usage:
 * ```tsx
 * // In your modal content file (e.g., ProductFormModal.tsx):
 * export default function ProductFormModal({ onSubmit, onCancel }) {
 *   return (
 *     <form onSubmit={onSubmit}>
 *       {/* Heavy form content with validation, date pickers, etc. *\/}
 *     </form>
 *   )
 * }
 *
 * // In your page file:
 * const ProductFormContent = lazy(() => import('@/components/modals/ProductFormModal'))
 *
 * <LazyModal isOpen={isOpen} onClose={handleClose} title="Add Product">
 *   <ProductFormContent onSubmit={handleSubmit} onCancel={handleClose} />
 * </LazyModal>
 * ```
 */
export function createLazyModalContent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) {
  return importFn
}
