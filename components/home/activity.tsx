'use client'

import { Star, Ticket } from 'lucide-react'
import Link from 'next/link'
import { BallRow } from '@/components/lotto/lotto-ball'
import { Panel, SectionHeading } from '@/components/lotto/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { formatDate, formatRand } from '@/lib/format'
import { getGame } from '@/lib/lottery/games'
import { useUserStore } from '@/lib/store/user-store'

export function Activity() {
  const { saved, tickets } = useUserStore()
  const hasAny = saved.length > 0 || tickets.length > 0

  return (
    <section aria-labelledby="activity-title" className="flex flex-col gap-3">
      <SectionHeading id="activity-title" title="My lottery activity" href="/my-lotto" />

      {!hasAny ? (
        <Panel>
          <Empty className="gap-3 p-4">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-primary/15 text-primary">
                <Star />
              </EmptyMedia>
              <EmptyTitle>Nothing saved yet</EmptyTitle>
              <EmptyDescription>Generate a combination and tap save — it will show up here.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="glow" size="lg" nativeButton={false} render={<Link href="/generate" />}>
                Generate numbers
              </Button>
            </EmptyContent>
          </Empty>
        </Panel>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Link href="/my-lotto/saved" className="glass flex flex-col gap-1 rounded-2xl p-3 active:scale-[0.98]">
            <Star className="size-5 text-bonus" aria-hidden="true" />
            <span className="font-heading text-2xl font-bold">{saved.length}</span>
            <span className="text-xs text-muted-foreground">Saved combinations</span>
          </Link>
          <Link href="/my-lotto/tickets" className="glass flex flex-col gap-1 rounded-2xl p-3 active:scale-[0.98]">
            <Ticket className="size-5 text-primary" aria-hidden="true" />
            <span className="font-heading text-2xl font-bold">{tickets.length}</span>
            <span className="text-xs text-muted-foreground">Tickets checked</span>
          </Link>
        </div>
      )}

      {saved.slice(0, 2).map((s) => {
        const g = getGame(s.gameId)
        return (
          <Panel key={s.id} as="article" className="flex flex-col gap-2 rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{s.label}</span>
              <Badge variant="secondary">{g.shortName}</Badge>
            </div>
            <BallRow main={s.main} bonus={s.bonus} size="sm" />
          </Panel>
        )
      })}

      {tickets.slice(0, 2).map((t) => {
        const g = getGame(t.gameId)
        return (
          <Panel key={t.id} as="article" className="flex items-center justify-between gap-2 rounded-2xl p-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">
                {g.name} · {formatDate(t.drawDate)}
              </span>
              <span className="text-xs text-muted-foreground">
                {t.mainMatches} matched{t.bonusMatched ? ' + bonus' : ''}
              </span>
            </div>
            {t.division ? (
              <Badge className="bg-success/20 text-success">
                Div {t.division}
                {t.prize ? ` · ${formatRand(t.prize)}` : ''}
              </Badge>
            ) : (
              <Badge variant="outline">No prize</Badge>
            )}
          </Panel>
        )
      })}
    </section>
  )
}
