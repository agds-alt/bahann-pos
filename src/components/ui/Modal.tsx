/**
 * Modal Component
 * Reusable modal/dialog component with backdrop and animations
 */
'use client'

import { ReactNode, useEffect } from 'react'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  footer?: ReactNode
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-full mx-4',
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  footer,
}: ModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className={`relative w-full ${sizeClasses[size]} bg-white rounded-t-[1.5rem] sm:rounded-[0.75rem] shadow-2xl transform transition-all max-h-[95vh] sm:max-h-[90vh] flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between card-mobile border-b-2 border-gray-200 flex-shrink-0">
              {title && (
                <h2 className="text-mobile-xl font-bold text-gray-900">{title}</h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="ml-auto min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors -mr-2"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="card-mobile overflow-y-auto flex-1 overscroll-contain">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="card-mobile border-t-2 border-gray-200 bg-gray-50 rounded-b-[1.5rem] sm:rounded-b-[0.75rem] flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
