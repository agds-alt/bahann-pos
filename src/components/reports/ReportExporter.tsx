/**
 * Report Exporter Component (Lazy Loadable)
 * Handles PDF and CSV export - only loaded when user requests export
 */
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'

interface ReportExporterProps {
  data: {
    salesTrend?: any[]
    topProducts?: any[]
    stats?: any
  }
  onClose: () => void
}

export default function ReportExporter({ data, onClose }: ReportExporterProps) {
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      if (format === 'pdf') {
        // Lazy load PDF generation library only when needed
        const { generatePDF } = await import('@/lib/exporters/pdf-generator')
        await generatePDF(data)
      } else {
        // Lazy load CSV generation
        const { generateCSV } = await import('@/lib/exporters/csv-generator')
        await generateCSV(data)
      }

      alert('Export completed successfully!')
      onClose()
    } catch (error) {
      alert('Export failed. Using fallback method.')
      // Fallback: Simple JSON download
      const dataStr = JSON.stringify(data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `report-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
      onClose()
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <Select
            label="Format"
            value={format}
            onChange={(e) => setFormat(e.target.value as 'pdf' | 'csv')}
            options={[
              { value: 'pdf', label: '📄 PDF Document' },
              { value: 'csv', label: '📊 CSV Spreadsheet' },
            ]}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Download'}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Export includes: Sales trends, top products, and performance metrics
      </p>
    </div>
  )
}
