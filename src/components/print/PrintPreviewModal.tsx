'use client'

import { useRef, useEffect } from 'react'
import { PrintReceipt, ReceiptData } from './PrintReceipt'
import { Button } from '@/components/ui/Button'

interface PrintPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  receiptData: ReceiptData
}

export function PrintPreviewModal({ isOpen, onClose, receiptData }: PrintPreviewModalProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Handle ESC key to close modal
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
    }
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const handlePrint = () => {
    if (!componentRef.current) return

    // Copy all <style> tags (including styled-jsx injected ones) so scoped
    // selectors still match the receipt HTML in the new window.
    const styleSheets = Array.from(document.querySelectorAll('style'))
      .map((s) => s.outerHTML)
      .join('\n')

    const receiptHTML = componentRef.current.outerHTML

    const printWindow = window.open('', '_blank', 'width=400,height=800')
    if (!printWindow) {
      alert('Aktifkan popup di browser untuk fitur print.')
      return
    }

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Struk Pembayaran</title>
  ${styleSheets}
  <style>
    @page { size: 80mm auto; margin: 0; }
    body { margin: 0; padding: 0; background: white; }
  </style>
</head>
<body>
  ${receiptHTML}
</body>
</html>`)

    printWindow.document.close()
    printWindow.focus()
    // Give the new window time to apply styles before printing
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 300)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Preview Struk</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="receipt-preview-wrapper">
            <PrintReceipt ref={componentRef} data={receiptData} />
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            🖨️ Print Struk
          </Button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 20px;
          backdrop-filter: blur(4px);
        }

        .modal-container {
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          border: 3px solid #e5e7eb;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 16px;
          border-bottom: 2px solid #e5e7eb;
        }

        .modal-title {
          font-size: 24px;
          font-weight: bold;
          color: #111827;
          margin: 0;
        }

        .modal-close {
          background: #f3f4f6;
          border: 2px solid #d1d5db;
          border-radius: 12px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
        }

        .modal-close:hover {
          background: #e5e7eb;
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.15);
        }

        .modal-close:active {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.1);
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .receipt-preview-wrapper {
          background: #f9fafb;
          border-radius: 16px;
          padding: 20px;
          border: 2px solid #e5e7eb;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .modal-footer {
          padding: 16px 24px 24px;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          border-top: 2px solid #e5e7eb;
        }

        /* Scrollbar styling */
        .modal-body::-webkit-scrollbar {
          width: 8px;
        }

        .modal-body::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 4px;
        }

        .modal-body::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }

        .modal-body::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

      `}</style>
    </div>
  )
}
