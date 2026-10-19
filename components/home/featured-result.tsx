'use client'

import { ArrowRight, CalendarClock, Hash } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useApp } from '@/components/app/app-providers'
import { BallRow } from '@/components/lotto/lotto-ball'
import { ProvenanceBadge } from '@/components/lotto/shared'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCountdown, useNow } from '@/hooks/use-now'
import { useDraws } from '@/lib/data/repository'
import { formatCompactRand, formatDayDate, formatRand } from '@/lib/format'
import { bonusLabel, nextDrawDate } from '@/lib/lottery/games'

export function FeaturedResult() {
  const { game } = useApp()
  const { latest, isLoading, error } = useDraws(game.id)
  const now = useNow()
  const next = now ? nextDrawDate(game, new Date(now)) : null

  return (
    <section aria-labelledby="featured-title" className="relative overflow-hidden rounded-[28px] ring-1 ring-white/12 shadow-[0_20px_60px_-20px_var(--accent)]">
      <Image
        src="/images/lab-hero.png"
        alt=""
        fill
        priority
        sizes="(max-width: 512px) 100vw, 512px"
        className="object-cover object-[30%_center] opacity-70"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.16_0.06_270/0.35)_0%,oklch(0.14_0.05_268/0.85)_55%,oklch(0.13_0.05_268/0.98)_100%)]" />
      <div className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />

      <div className="relative flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">Latest result</p>
            <h2 id="featured-title" className="text-2xl font-bold">
              {game.name}
            </h2>
          </div>
          {latest && <ProvenanceBadge provenance={latest.provenance} />}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading latest result">
            <Skeleton className="h-4 w-40 bg-white/10" />
            <div className="flex gap-1.5">
              {Array.from({ length: game.mainCount + (game.bonusKind === 'none' ? 0 : 1) }).map((_, i) => (
                <Skeleton key={i} className="size-11 rounded-full bg-white/10" />
              ))}
            </div>
          </div>
        ) : error || !latest ? (
          <p className="text-sm text-muted-foreground">
            {"We couldn't load this game's results right now. Your saved draws will appear once we reconnect."}
          </p>
        ) : (
          <>
            <p className="flex items-center gap-1.5 text-sm text-foreground/80">
              <Hash className="size-3.5" aria-hidden="true" />
              Draw {latest.drawNumber} · {formatDayDate(latest.date)}
            </p>
            <BallRow
              main={latest.main}
              bonus={latest.bonus}
              bonusLabel={bonusLabel(game)}
              animate
              animationKey={latest.id}
              size="md"
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-black/25 p-3 ring-1 ring-white/10 backdrop-blur-sm">
                <p className="text-[11px] text-muted-foreground">{latest.rolledOver ? 'Jackpot rolled over' : 'Jackpot'}</p>
                <p className="font-heading text-lg font-bold tabular-nums">
                  {latest.jackpot ? formatRand(latest.jackpot) : 'Not available'}
                </p>
              </div>
              <div className="rounded-2xl bg-black/25 p-3 ring-1 ring-white/10 backdrop-blur-sm">
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <CalendarClock className="size-3" aria-hidden="true" />
                  Next draw {next ? `in ${formatCountdown(next, now!)}` : ''}
                </p>
                <p className="font-heading text-lg font-bold text-bonus tabular-nums">
                  {latest.nextJackpot ? `≈ ${formatCompactRand(latest.nextJackpot)}` : 'To be announced'}
                </p>
              </div>
            </div>
          </>
        )}

        <Button variant="glow" size="xl" className="w-full" nativeButton={false} render={<Link href="/results" />}>
          View Results
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </section>
  )
}
