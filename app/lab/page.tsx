'use client'

import Link from 'next/link'
import { useApp } from '@/components/app/app-providers'
import { GameSelector } from '@/components/lotto/game-selector'
import { Panel, RandomnessNote } from '@/components/lotto/shared'
import { useDraws } from '@/lib/data/repository'
import { frequency, hotCold } from '@/lib/lottery/stats'
import { jackpotOdds } from '@/lib/lottery/odds'
import { LAB_TOOLS } from '@/lib/navigation'

export default function LabPage() {
  const { game } = useApp()
  const { draws, isLoading } = useDraws(game.id)
  const frequencyStats = draws.length ? frequency(game, draws) : []
  const hot = draws.length ? hotCold(game, draws, 20, 5).hot : []
  return (
    <div className="flex flex-col gap-5 pt-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Lottery laboratory</h1>
        <p className="mt-1 text-sm text-muted-foreground">Understand draw history. Every combination has the same jackpot probability.</p>
      </div>
      <GameSelector />
      <Panel>
        <h2 className="text-sm text-muted-foreground">Jackpot odds per line</h2>
        <p className="mt-2 font-heading text-2xl font-bold">1 in {jackpotOdds(game).toLocaleString('en-ZA')}</p>
        <p className="mt-2 text-xs text-muted-foreground">Theoretical odds for the current game rules.</p>
      </Panel>
      <Panel>
        <h2 className="font-semibold">Real draws analysed</h2>
        <p className="mt-2 text-2xl font-bold">{isLoading ? '…' : draws.length.toLocaleString('en-ZA')}</p>
        <p className="mt-1 text-xs text-muted-foreground">Current rules, 1 June 2026 onward. The source may have gaps.</p>
      </Panel>
      {frequencyStats.length > 0 ? (
        <Panel>
          <h2 className="font-semibold">Most frequent · {game.name}</h2>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {[...frequencyStats].sort((a, b) => b.count - a.count).slice(0, 5).map((stat) => (
              <div key={stat.number} className="rounded-xl bg-white/5 p-2 text-center">
                <p className="text-lg font-bold">{stat.number}</p>
                <p className="text-xs text-muted-foreground">{stat.count}×</p>
              </div>
            ))}
          </div>
          <h3 className="mt-5 font-semibold">Recently common · last 20 draws</h3>
          <p className="mt-2 text-sm text-muted-foreground">{hot.map((x) => x.number).join(' · ')}</p>
        </Panel>
      ) : (
        <Panel>
          <p className="text-sm text-muted-foreground">No published draw history is stored for this game. Use Data Updates when connected. Missing games are never replaced with made-up numbers.</p>
          <Link href="/info/updates" className="mt-3 inline-block text-sm font-semibold text-primary underline">Update results</Link>
        </Panel>
      )}
      <div className="grid grid-cols-2 gap-3">
        {LAB_TOOLS.map((item) => {
          const Icon = item.icon
          return <Link key={item.href} href={item.href} className="glass flex min-h-28 flex-col gap-2 rounded-2xl p-4">
            <Icon className="size-5 text-primary" />
            <span className="text-sm font-semibold">{item.label}</span>
            {item.description && <span className="text-xs text-muted-foreground">{item.description}</span>}
          </Link>
        })}
      </div>
      <RandomnessNote />
    </div>
  )
}
