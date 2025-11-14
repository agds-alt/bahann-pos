/**
 * Revenue Distribution Pie Chart Component (Lazy Loadable)
 */
'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartLabelProps } from '@/types'

interface RevenuePieChartProps {
  data: Array<{ name: string; value: number; color: string }>
  formatCurrency?: (value: number) => string
  height?: number
}

export default function RevenuePieChartLazy({
  data,
  formatCurrency = (v) => v.toString(),
  height = 320,
}: RevenuePieChartProps) {
  return (
    <div style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: ChartLabelProps) => {
              const name = props.value as string
              const percent = (props.index !== undefined && data[props.index])
                ? (data[props.index].value / data.reduce((sum, d) => sum + d.value, 0)) * 100
                : 0
              return `${name}: ${percent.toFixed(0)}%`
            }}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
