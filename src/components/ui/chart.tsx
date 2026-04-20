'use client'

import * as React from 'react'
import { ResponsiveContainer } from 'recharts'

// ─── ChartContainer ────────────────────────────────────────────────────────────

interface ChartContainerProps {
  children: React.ComponentProps<typeof ResponsiveContainer>['children']
  height?: number
  className?: string
  aspectRatio?: 'video' | 'square' | 'auto'
}

export function ChartContainer({
  children,
  height = 320,
  className = '',
  aspectRatio = 'auto',
}: ChartContainerProps) {
  const heightStyle =
    aspectRatio === 'video'
      ? { aspectRatio: '16/9' }
      : aspectRatio === 'square'
        ? { aspectRatio: '1/1' }
        : { height }

  return (
    <div
      className={`w-full ${className}`}
      style={heightStyle}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

// ─── ChartTooltipContent ───────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name?: string
  value?: number | string
  color?: string
  dataKey?: string
  payload?: Record<string, unknown>
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
  labelFormatter?: (label: string) => string
  formatter?: (value: number) => string
  hideLabel?: boolean
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  formatter,
  hideLabel = false,
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null

  const displayLabel = label
    ? labelFormatter
      ? labelFormatter(label)
      : label
    : null

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
      {!hideLabel && displayLabel && (
        <p className="mb-2 font-semibold text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-wide">
          {displayLabel}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-500 dark:text-gray-400 capitalize">
                {item.name}
              </span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
              {typeof item.value === 'number' && formatter
                ? formatter(item.value)
                : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Chart color helpers ───────────────────────────────────────────────────────

export const CHART_COLORS = {
  emerald: '#10b981',
  blue: '#3b82f6',
  amber: '#f59e0b',
  violet: '#8b5cf6',
  rose: '#ef4444',
  sky: '#0ea5e9',
  orange: '#f97316',
  teal: '#14b8a6',
  pink: '#ec4899',
  indigo: '#6366f1',
} as const

export type ChartColor = keyof typeof CHART_COLORS

// ─── GradientDef ──────────────────────────────────────────────────────────────

interface GradientDefProps {
  id: string
  color: string
  fromOpacity?: number
  toOpacity?: number
}

export function GradientDef({ id, color, fromOpacity = 0.4, toOpacity = 0 }: GradientDefProps) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity={fromOpacity} />
        <stop offset="95%" stopColor={color} stopOpacity={toOpacity} />
      </linearGradient>
    </defs>
  )
}
