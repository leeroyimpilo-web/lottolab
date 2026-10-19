'use client'

import { Flame, Snowflake, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { useApp } from '@/components/app/app-providers'
import { FrequencyChart } from '@/components/lotto/frequency-chart'
import { LottoBall } from '@/components/lotto/lotto-ball'
import { OddEvenDonut } from '@/components/lotto/odd-even-donut'
import { Panel, RandomnessNote, SectionHeading, StatTile } from '@/components/lotto/shared'
import { Skeleton } from '@/components/ui/skeleton'
import { useDraws } from '@/lib/data/repository'
import { formatDate, formatNumber } from '@/lib/format'
import { frequency, hotCold, oddEven } from '@/lib/lottery/stats'

export function StatsOverview() {
  const { game } = useApp()
  const { draws, isLoading } = useDraws(game.id)

  const stats = useMemo(() => {
    if (!draws.length) return null
    const freq = frequency(game, draws)
    const sorted = [...freq].sort((a, b) => b.count - a.count)
    const recent = hotCold(game, draws, 20, 4)
    return {
      freq,
      most: sorted.slice(0, 5),
      least: sorted.slice(-5).reverse(),
      trending: recent.hot,
      oe: oddEven(draws),
      first: draws[draws.length - 1].date,
    }
  }, [draws, game])

  return (
    <section aria-labelledby="stats-title" className="flex flex-col gap-3">
      <SectionHeading id="stats-title" title="Statistics overview" href="/lab" linkLabel="Open Lab" />

      {isLoading || !stats ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Draws analysed" value={formatNumber(draws.length)} hint={`Since ${formatDate(stats.first)}`} />
            <Panel as="div" className="flex items-center gap-2 rounded-2xl p-2 pr-3">
              <OddEvenDonut odd={stats.oe.odd} even={stats.oe.even} className="h-20" />
              <div className="flex flex-col text-[11px] leading-tight text-muted-foreground">
                <span className="font-medium text-foreground">Odd vs even</span>
                <span>{formatNumber(stats.oe.odd)} odd</span>
                <span>{formatNumber(stats.oe.even)} even</span>
              </div>
            </Panel>
          </div>

          <Panel className="flex flex-col gap-4">
            <NumberStrip icon={Flame} title="Most drawn" tone="text-bonus" numbers={stats.most.map((s) => ({ n: s.number, sub: `${s.count}×` }))} />
            <NumberStrip icon={Snowflake} title="Least drawn" tone="text-primary" numbers={stats.least.map((s) => ({ n: s.number, sub: `${s.count}×` }))} />
            <NumberStrip
              icon={TrendingUp}
              title="Trending · last 20 draws"
              tone="text-success"
              numbers={stats.trending.map((s) => ({ n: s.number, sub: `${s.count}×` }))}
            />
          </Panel>

          <Panel className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Number frequency</h3>
              <span className="text-[11px] text-muted-foreground">Tap a bar for details</span>
            </div>
            <FrequencyChart stats={stats.freq} />
          </Panel>

          <RandomnessNote />
        </>
      )}
    </section>
  )
}

function NumberStrip({
  icon: Icon,
  title,
  tone,
  numbers,
}: {
  icon: typeof Flame
  title: string
  tone: string
  numbers: { n: number; sub: string }[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Icon className={`size-4 ${tone}`} aria-hidden="true" />
        {title}
      </h3>
      <ul className="flex gap-2">
        {numbers.map(({ n, sub }) => (
          <li key={n} className="flex flex-col items-center gap-1">
            <LottoBall number={n} size="sm" />
            <span className="text-[10px] text-muted-foreground tabular-nums">{sub}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
