'use client'

import { useApp } from '@/components/app/app-providers'
import { BallRow } from '@/components/lotto/lotto-ball'
import { GameSelector } from '@/components/lotto/game-selector'
import { Panel, ProvenanceBadge } from '@/components/lotto/shared'
import { useDraws } from '@/lib/data/repository'
import { formatDayDate } from '@/lib/format'
import { bonusLabel } from '@/lib/lottery/games'
import Link from 'next/link'

export default function ResultsPage() {
  const { game } = useApp()
  const { draws, isLoading, error } = useDraws(game.id)

  return (
    <div className="flex flex-col gap-5 pt-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold">Lottery results</h1>
        <p className="text-sm text-muted-foreground">
          Published South African draw history under the rules introduced in June 2026.
        </p>
      </div>
      <GameSelector />
      {isLoading ? (
        <Panel><p role="status" className="text-sm text-muted-foreground">Loading saved results…</p></Panel>
      ) : error ? (
        <Panel><p role="alert" className="text-sm text-muted-foreground">Results could not be loaded. Check Data Updates or try again when connected.</p></Panel>
      ) : !draws.length ? (
        <Panel>
          <h2 className="font-semibold">No confirmed draw history available</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This source does not yet provide Lotto 5 Max results, or you have not downloaded your first draw archive.
            We will never replace missing results with sample numbers.
          </p>
          <Link href="/info/updates" className="mt-4 inline-block text-sm font-semibold text-primary underline">
            Update lottery data
          </Link>
        </Panel>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{draws.length.toLocaleString('en-ZA')} stored results · Newest first</p>
          <div className="flex flex-col gap-3">
            {draws.slice(0, 100).map((draw) => (
              <Panel as="article" key={draw.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{formatDayDate(draw.date)}</h2>
                    <p className="text-xs text-muted-foreground">{game.name}{draw.drawNumber > 0 ? ` · Draw ${draw.drawNumber}` : ''}</p>
                  </div>
                  <ProvenanceBadge provenance={draw.provenance} />
                </div>
                <BallRow main={draw.main} bonus={draw.bonus} bonusLabel={bonusLabel(game)} size="sm" />
              </Panel>
            ))}
          </div>
          {draws.length > 100 && (
            <p className="text-center text-xs text-muted-foreground">
              Showing 100 recent results. All stored draws are used for statistics.
            </p>
          )}
        </>
      )}
      <p className="text-xs leading-relaxed text-muted-foreground">
        Data: <a href="https://bettip.co.za/" target="_blank" rel="noopener noreferrer" className="underline">BetTip</a>.
        Provider verification flags are not independent confirmation. Always check the National Lottery for official results.
      </p>
    </div>
  )
}
