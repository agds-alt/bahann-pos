/**
 * Daily Revenue Bar Chart Component (Lazy Loadable)
 */
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DailyRevenueBarChartProps {
  data: Array<{ date: string; revenue: number }>
  formatCurrency?: (value: number) => string
  formatDate?: (date: string) => string
  height?: number
}

export default function DailyRevenueBarChartLazy({
  data,
  formatCurrency = (v) => v.toString(),
  formatDate = (d) => d,
  height = 320,
}: DailyRevenueBarChartProps) {
  return (
    <div style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
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
          <Bar
            dataKey="revenue"
            name="Daily Revenue"
            fill="#10b981"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
