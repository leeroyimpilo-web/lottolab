'use client'

import Link from 'next/link'
import { ArrowUpRight, CalendarDays, RefreshCw, Database } from 'lucide-react'
import { useApp } from '@/components/app/app-providers'
import { BallRow, LottoBall } from '@/components/lotto/lotto-ball'
import { useDraws } from '@/lib/data/repository'
import { formatDayDate } from '@/lib/format'
import { GAMES, bonusLabel, type GameDefinition } from '@/lib/lottery/games'

const accent: Record<GameDefinition['family'], string> = {
  lotto: 'bg-[#f5c71c]',
  powerball: 'bg-[#e54953]',
  daily: 'bg-[#129563]',
}
function DrawCard({ game }: { game: GameDefinition }) {
  const { latest, error, isLoading } = useDraws(game.id)
  const { setGameId } = useApp()
  return (
    <Link href="/results" onClick={() => setGameId(game.id)}
      aria-label={'View ' + game.name + ' results'}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm focus-visible:outline-2 focus-visible:outline-primary">
      <div className="flex">
        <span className={'w-1.5 shrink-0 ' + accent[game.family]} aria-hidden="true" />
        <div className="min-w-0 flex-1 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-heading text-[15px] font-bold">{game.name}</h2>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
          </div>
          {latest ? (
            <>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {formatDayDate(latest.date)}{latest.drawNumber > 0 ? ' · Draw ' + latest.drawNumber : ''}
              </p>
              <BallRow main={latest.main} bonus={latest.bonus} bonusLabel={bonusLabel(game)} size="sm" className="mt-3" />
              <p className="mt-2.5 text-[11px] text-muted-foreground">
                {latest.jackpot == null ? 'Jackpot and payouts not yet provided' : 'Jackpot details available'}
                {' · '}Independent results feed
              </p>
            </>
          ) : (
            <div role="status" className="mt-3">
              <div className="flex flex-wrap items-center gap-1.5" aria-hidden="true">
                {Array.from({ length: game.mainCount }, (_, index) => <LottoBall key={index} number={null} size="xs" />)}
                {game.bonusKind !== 'none' && <><span className="text-muted-foreground">+</span><LottoBall number={null} size="xs" /></>}
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                {isLoading ? <RefreshCw className="size-3 animate-spin" /> : <Database className="size-3" />}
                {isLoading ? 'Loading saved results…' : error ? 'Could not load results' : 'No published draw stored yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
export function AllResults() {
  return <section aria-label="Latest results by game" className="grid gap-3">{GAMES.map(game => <DrawCard key={game.id} game={game} />)}</section>
}
