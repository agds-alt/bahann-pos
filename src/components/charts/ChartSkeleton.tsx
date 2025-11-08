/**
 * Loading skeleton for chart components
 * Shown while lazy-loaded chart components are being fetched
 */
export function ChartSkeleton() {
  return (
    <div className="h-64 w-full animate-pulse">
      <div className="h-full w-full bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-500">Loading chart...</p>
        </div>
      </div>
    </div>
  )
}
