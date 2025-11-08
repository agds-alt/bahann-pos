'use client'

import { lazy, Suspense } from 'react'
import { ChartSkeleton } from './ChartSkeleton'

/**
 * Lazy-loaded chart components to optimize bundle size
 * Charts are heavy dependencies (recharts ~100KB+) that don't need to be in the initial bundle
 */

// Lazy load chart component
const RevenueLineChartLazy = lazy(() =>
  import('./RevenueLineChart').then((mod) => ({ default: mod.RevenueLineChart }))
)

// Export wrapped components with Suspense
export function RevenueLineChart(props: React.ComponentProps<typeof RevenueLineChartLazy>) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <RevenueLineChartLazy {...props} />
    </Suspense>
  )
}

// Re-export skeleton for direct use if needed
export { ChartSkeleton }
