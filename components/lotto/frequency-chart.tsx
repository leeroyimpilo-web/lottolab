'use client'

import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import type { NumberStat } from '@/lib/lottery/stats'
import { cn } from '@/lib/utils'

const config = {
  count: { label: 'Times drawn', color: 'var(--chart-1)' },
} satisfies ChartConfig

interface FrequencyChartProps {
  stats: NumberStat[]
  highlight?: number[]
  className?: string
  showAxis?: boolean
}

export function FrequencyChart({ stats, highlight = [], className, showAxis = true }: FrequencyChartProps) {
  const max = Math.max(1, ...stats.map((s) => s.count))
  const min = Math.min(...stats.map((s) => s.count))

  return (
    <ChartContainer config={config} className={cn('aspect-auto h-44 w-full', className)}>
      <BarChart data={stats} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barCategoryGap={1}>
        {showAxis && (
          <XAxis
            dataKey="number"
            tickLine={false}
            axisLine={false}
            interval={stats.length > 40 ? 4 : stats.length > 20 ? 2 : 0}
            tick={{ fontSize: 10 }}
          />
        )}
        <YAxis hide domain={[0, max]} />
        <ChartTooltip
          cursor={{ fill: 'oklch(1 0 0 / 0.06)' }}
          content={<ChartTooltipContent labelFormatter={(_, p) => `Number ${p?.[0]?.payload?.number}`} />}
        />
        <Bar dataKey="count" radius={[4, 4, 1, 1]} isAnimationActive animationDuration={700}>
          {stats.map((s) => {
            const t = (s.count - min) / Math.max(1, max - min)
            const fill = highlight.includes(s.number)
              ? 'var(--bonus)'
              : t > 0.75
                ? 'var(--chart-1)'
                : t > 0.4
                  ? 'var(--chart-2)'
                  : 'var(--chart-3)'
            return <Cell key={s.number} fill={fill} fillOpacity={0.35 + t * 0.65} />
          })}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
