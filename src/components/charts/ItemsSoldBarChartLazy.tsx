/**
 * Items Sold Bar Chart Component (Lazy Loadable)
 */
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ItemsSoldBarChartProps {
  data: Array<{ date: string; itemsSold: number }>
  formatDate?: (date: string) => string
  height?: number
}

export default function ItemsSoldBarChartLazy({
  data,
  formatDate = (d) => d,
  height = 320,
}: ItemsSoldBarChartProps) {
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
          <YAxis stroke="#6b7280" />
          <Tooltip labelFormatter={formatDate} />
          <Legend />
          <Bar
            dataKey="itemsSold"
            name="Items Sold"
            fill="#2563eb"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
