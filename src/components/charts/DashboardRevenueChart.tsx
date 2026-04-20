'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { CHART_COLORS } from '@/components/ui/chart'

// Nivo must be client-only — no SSR
const ResponsiveLine = dynamic(
  () => import('@nivo/line').then((m) => m.ResponsiveLine),
  { ssr: false }
)

interface DataPoint {
  date: string
  revenue: number
}

interface DashboardRevenueChartProps {
  data: DataPoint[]
  formatCurrency: (v: number) => string
  formatDate: (d: string) => string
  height?: number
}

export default function DashboardRevenueChart({
  data,
  formatCurrency,
  formatDate,
  height = 280,
}: DashboardRevenueChartProps) {
  const nivoData = useMemo(() => {
    if (!data || data.length === 0) return []
    return [
      {
        id: 'revenue',
        data: data.map((d) => ({ x: d.date, y: d.revenue })),
      },
    ]
  }, [data])

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-gray-400 dark:text-gray-500"
        style={{ height }}
      >
        Belum ada data penjualan
      </div>
    )
  }

  const avg = data.reduce((s, d) => s + d.revenue, 0) / data.length

  return (
    <div style={{ height }}>
      <ResponsiveLine
        data={nivoData}
        margin={{ top: 12, right: 20, bottom: 44, left: 64 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 0, max: 'auto', stacked: false }}
        curve="monotoneX"
        enableArea
        areaBaselineValue={0}
        areaOpacity={0.12}
        colors={[CHART_COLORS.emerald]}
        lineWidth={2.5}
        enablePoints={false}
        enableGridX={false}
        enableGridY
        gridYValues={5}
        theme={{
          grid: {
            line: {
              stroke: 'rgba(107,114,128,0.12)',
              strokeDasharray: '4 4',
            },
          },
          axis: {
            ticks: {
              text: {
                fontSize: 11,
                fill: '#9ca3af',
              },
            },
            domain: {
              line: {
                stroke: 'transparent',
              },
            },
          },
          crosshair: {
            line: {
              stroke: CHART_COLORS.emerald,
              strokeOpacity: 0.4,
              strokeWidth: 1.5,
              strokeDasharray: '4 4',
            },
          },
        }}
        axisBottom={{
          tickSize: 0,
          tickPadding: 10,
          format: (v) => formatDate(v as string),
          tickValues: data.length > 10
            ? data
                .filter((_, i) => i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 5) === 0)
                .map((d) => d.date)
            : undefined,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 10,
          tickValues: 5,
          format: (v) => `${((v as number) / 1_000_000).toFixed(1)}M`,
        }}
        markers={[
          {
            axis: 'y',
            value: avg,
            lineStyle: {
              stroke: CHART_COLORS.emerald,
              strokeOpacity: 0.35,
              strokeDasharray: '6 4',
              strokeWidth: 1.5,
            },
            legend: `Avg: ${formatCurrency(avg)}`,
            legendPosition: 'top-right',
            textStyle: {
              fontSize: 10,
              fill: CHART_COLORS.emerald,
              fontWeight: 600,
            },
          },
        ]}
        useMesh
        crosshairType="x"
        tooltip={({ point }) => {
          const raw = point.data as { x: string; y: number }
          return (
            <div
              className="rounded-xl border px-3 py-2 shadow-xl text-xs"
              style={{
                background: 'var(--chart-tooltip-bg)',
                borderColor: 'var(--chart-tooltip-border)',
                backdropFilter: 'blur(8px)',
                minWidth: 140,
              }}
            >
              <p className="mb-1.5 font-semibold text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wide">
                {formatDate(raw.x)}
              </p>
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: CHART_COLORS.emerald }}
                />
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(raw.y)}
                </span>
              </div>
            </div>
          )
        }}
      />
    </div>
  )
}
