'use client'

import { Label, Pie, PieChart } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { cn } from '@/lib/utils'

const config = {
  odd: { label: 'Odd', color: 'var(--chart-1)' },
  even: { label: 'Even', color: 'var(--chart-3)' },
} satisfies ChartConfig

export function OddEvenDonut({ odd, even, className }: { odd: number; even: number; className?: string }) {
  const total = odd + even || 1
  const data = [
    { key: 'odd', value: odd, fill: 'var(--color-odd)' },
    { key: 'even', value: even, fill: 'var(--color-even)' },
  ]
  return (
    <ChartContainer config={config} className={cn('aspect-square h-28', className)}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="key" innerRadius="68%" outerRadius="100%" strokeWidth={0} paddingAngle={3} cornerRadius={6}>
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !('cx' in viewBox)) return null
              return (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 6} className="fill-foreground font-heading text-lg font-bold">
                    {Math.round((odd / total) * 100)}%
                  </tspan>
                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 12} className="fill-muted-foreground text-[10px]">
                    odd
                  </tspan>
                </text>
              )
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
