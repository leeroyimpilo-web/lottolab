'use client'

import { Bell, CalendarClock, Database, Trophy } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '@/components/app/app-providers'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useDraws } from '@/lib/data/repository'
import { formatCompactRand, formatDayDate } from '@/lib/format'
import { nextDrawDate } from '@/lib/lottery/games'
import { useSyncState } from '@/lib/store/sync-store'
import { formatRelative } from '@/lib/format'

export function NotificationsSheet() {
  const { game } = useApp()
  const { latest } = useDraws(game.id)
  const sync = useSyncState()
  const [seen, setSeen] = useState(false)

  const items = [
    latest && {
      icon: Trophy,
      title: `${game.name} results are in`,
      body: `Draw ${latest.drawNumber} on ${formatDayDate(latest.date)}: ${latest.main.join(', ')}${latest.bonus ? ` + ${latest.bonus}` : ''}`,
    },
    latest?.nextJackpot && {
      icon: CalendarClock,
      title: `Next ${game.name} jackpot`,
      body: `Estimated ${formatCompactRand(latest.nextJackpot)} on ${formatDayDate(nextDrawDate(game))}`,
    },
    {
      icon: Database,
      title: 'Draw library updated',
      body: sync.lastSync ? `Last update ${formatRelative(sync.lastSync).toLowerCase()}` : 'Waiting for first update',
    },
  ].filter(Boolean) as { icon: typeof Bell; title: string; body: string }[]

  return (
    <Sheet onOpenChange={(open) => open && setSeen(true)}>
      <SheetTrigger
        render={
          <Button variant="glass" size="icon-touch" aria-label="Notifications" className="relative">
            <Bell />
            {!seen && <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-bonus ring-2 ring-background" />}
          </Button>
        }
      />
      <SheetContent side="right" className="w-[86%] max-w-sm border-white/10 bg-sidebar">
        <SheetHeader>
          <SheetTitle className="font-heading text-lg">Notifications</SheetTitle>
          <SheetDescription>Updates about draws and your data.</SheetDescription>
        </SheetHeader>
        <ul className="flex flex-col gap-2 px-4">
          {items.map((item) => (
            <li key={item.title} className="flex gap-3 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/[0.07]">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  )
}
