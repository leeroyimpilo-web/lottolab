'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/components/app/app-providers'
import { BallRow } from '@/components/lotto/lotto-ball'
import { GameSelector } from '@/components/lotto/game-selector'
import { Panel, RandomnessNote } from '@/components/lotto/shared'
import { useDraws } from '@/lib/data/repository'
import { formatDayDate, formatOdds } from '@/lib/format'
import { bonusLabel } from '@/lib/lottery/games'
import { divisionRules, divisionOdds } from '@/lib/lottery/odds'
import { frequency, hotCold, combinationOccurrences, oddEven, consecutiveStats, sumDistribution } from '@/lib/lottery/stats'

const TITLES: Record<string,string> = {
  frequency: 'Number frequency',
  'hot-cold': 'Hot & cold numbers',
  combinations: 'Combination analyzer',
  history: 'Historical draws',
  patterns: 'Number patterns',
  probability: 'Probability explorer',
  advanced: 'Advanced statistics',
}
export function LabDetail({ tool }: { tool: string }) {
  const { game } = useApp()
  const { draws, isLoading } = useDraws(game.id)
  const [raw, setRaw] = useState('')
  const freq = useMemo(() => draws.length ? frequency(game, draws) : [], [game, draws])
  const recent = useMemo(() => draws.length ? hotCold(game, draws, 20, 6) : null, [game, draws])
  const userNums = raw.split(/[\s,;]+/).filter(Boolean).map(Number)
  const valid = userNums.length === game.mainCount &&
    userNums.every((n) => Number.isInteger(n) && n >= 1 && n <= game.mainMax) &&
    new Set(userNums).size === userNums.length
  const combinations = valid ? combinationOccurrences(draws, userNums) : null
  const splits = draws.length ? oddEven(draws) : null
  const consecutive = draws.length ? consecutiveStats(draws) : null
  const sums = draws.length ? sumDistribution(draws) : null

  return <div className="flex flex-col gap-5 pt-8">
    <Link href="/lab" className="text-sm font-semibold text-primary">← Laboratory</Link>
    <div>
      <h1 className="font-heading text-2xl font-bold">{TITLES[tool] ?? 'Laboratory'}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Statistics describe the past. They do not change your next-draw probability.</p>
    </div>
    <GameSelector />
    <Panel>
      <p className="text-sm text-muted-foreground">Published current-rule draws</p>
      <p className="mt-1 text-xl font-bold">{isLoading ? '…' : draws.length.toLocaleString('en-ZA')}</p>
    </Panel>
    {tool === 'probability' && <Panel>
      <h2 className="font-semibold">Odds per valid line</h2>
      <div className="mt-3 flex flex-col gap-3">
        {divisionRules(game).map((rule) => <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3" key={rule.division}>
          <div><p className="text-sm font-semibold">Division {rule.division}</p><p className="text-xs text-muted-foreground">{rule.label}</p></div>
          <p className="text-sm font-bold tabular-nums">{formatOdds(divisionOdds(game, rule))}</p>
        </div>)}
      </div>
    </Panel>}
    {tool === 'combinations' && <Panel className="flex flex-col gap-3">
      <label htmlFor="numbers" className="text-sm font-semibold">Enter your {game.mainCount} numbers</label>
      <input id="numbers" value={raw} onChange={e => setRaw(e.target.value)} inputMode="numeric"
        placeholder="e.g. 3 8 12 25 33 44" className="min-h-12 rounded-xl bg-background px-3 ring-1 ring-white/20" />
      {raw && !valid && <p className="text-xs text-bonus">Use {game.mainCount} distinct numbers from 1 to {game.mainMax}.</p>}
      {combinations && <>
        <p className="text-sm font-semibold">Exact matches in this dataset: {combinations.exact.length}</p>
        <h3 className="font-semibold">Closest historical results</h3>
        {combinations.best.map(({ draw, matches }) => <div className="border-t border-white/10 pt-2" key={draw.id}>
          <p className="mb-2 text-xs text-muted-foreground">{formatDayDate(draw.date)} · {matches} matches</p>
          <BallRow main={draw.main} bonus={draw.bonus} size="xs" matches={userNums} />
        </div>)}
      </>}
    </Panel>}
    {tool === 'history' && (draws.length
      ? <div className="flex flex-col gap-3">{draws.slice(0, 100).map(draw => <Panel as="article" className="flex flex-col gap-2" key={draw.id}>
          <h2 className="text-sm font-semibold">{formatDayDate(draw.date)}</h2>
          <BallRow main={draw.main} bonus={draw.bonus} bonusLabel={bonusLabel(game)} size="sm" />
        </Panel>)}</div>
      : <Panel><p className="text-sm text-muted-foreground">No draw history available. <Link className="underline text-primary" href="/info/updates">Check updates</Link>.</p></Panel>)}
    {tool === 'frequency' && freq.length > 0 && <Panel>
      <h2 className="font-semibold">Occurrences by number</h2>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {freq.map(stat => <div className="rounded-xl bg-white/5 px-2 py-3 text-center" key={stat.number}>
          <p className="font-heading text-lg font-bold">{stat.number}</p>
          <p className="text-xs text-muted-foreground">{stat.count}×</p>
        </div>)}
      </div>
    </Panel>}
    {tool === 'hot-cold' && recent && <Panel className="flex flex-col gap-4">
      {([['Often drawn · last 20', recent.hot], ['Least drawn · last 20', recent.cold], ['Longest absent · current history', recent.overdue]] as const).map(([title, numbers]) =>
        <div key={title}>
          <h2 className="mb-2 font-semibold">{title}</h2>
          <div className="grid grid-cols-6 gap-1">{numbers.map(stat =>
            <div key={stat.number} className="rounded-lg bg-white/5 py-2 text-center"><p className="font-semibold">{stat.number}</p><p className="text-[11px] text-muted-foreground">{title.includes('absent') ? stat.gap : stat.count}</p></div>
          )}</div>
        </div>)}
    </Panel>}
    {tool === 'patterns' && splits && consecutive && <Panel className="flex flex-col gap-4">
      <h2 className="font-semibold">Odd and even numbers</h2>
      <p className="text-sm text-muted-foreground">Odd: {splits.odd.toLocaleString('en-ZA')} · Even: {splits.even.toLocaleString('en-ZA')}</p>
      <h2 className="font-semibold">Consecutive pairs</h2>
      <p className="text-sm text-muted-foreground">{consecutive.withPair} of {consecutive.total} draws included a consecutive pair.</p>
      <p className="text-xs text-muted-foreground">{consecutive.topPairs.map(([pair, count]) => `${pair} (${count}×)`).join(' · ')}</p>
    </Panel>}
    {tool === 'advanced' && sums && <Panel>
      <h2 className="font-semibold">Sum of drawn numbers</h2>
      <p className="mt-3 text-sm text-muted-foreground">Average sum: <strong className="text-foreground">{sums.average.toFixed(1)}</strong></p>
      <h3 className="mt-4 font-semibold">Sum distribution</h3>
      <div className="mt-2 flex flex-col gap-2">
        {sums.buckets.map(({ range, count }) => <div key={range} className="flex justify-between border-b border-white/10 pb-1 text-sm"><span>{range}–{Number(range) + 19}</span><strong>{count}</strong></div>)}
      </div>
    </Panel>}
    {tool !== 'probability' && tool !== 'history' && tool !== 'combinations' && !draws.length && !isLoading &&
      <Panel><p className="text-sm text-muted-foreground">Historical statistics are unavailable until the source has published draw data. No demo numbers are used.</p></Panel>}
    <RandomnessNote />
  </div>
}
