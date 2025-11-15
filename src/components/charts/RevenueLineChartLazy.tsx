/**
 * Revenue Line Chart Component (Lazy Loadable)
 * Isolated Recharts component for code splitting
 */
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface RevenueLineChartProps {
  data: Array<{ date: string; revenue: number }>
  formatCurrency?: (value: number) => string
  formatDate?: (date: string) => string
  height?: number
}

export default function RevenueLineChartLazy({
  data,
  formatCurrency = (v) => v.toString(),
  formatDate = (d) => d,
  height = 320,
}: RevenueLineChartProps) {
  return (
    <div style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#6b7280"
          />
          <YAxis
            stroke="#6b7280"
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={formatDate}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
