'use client'

import { Menu } from 'lucide-react'
import Image from 'next/image'
import { useApp } from '@/components/app/app-providers'
import { SyncIndicator } from '@/components/app/sync-indicator'
import { Button } from '@/components/ui/button'
import { useNow } from '@/hooks/use-now'
import { NotificationsSheet } from './notifications-sheet'

function greeting(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function HomeHeader() {
  const { setDrawerOpen } = useApp()
  const now = useNow()
  const date = now ? new Date(now) : null

  return (
    <header className="flex flex-col gap-5 pt-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/lottolab-logo.png"
            alt="LottoLab"
            width={44}
            height={44}
            priority
            className="size-11 rounded-xl object-cover shadow-[0_0_24px_-4px_var(--accent)]"
          />
          <span className="font-heading text-xl font-bold tracking-tight">
            Lotto<span className="text-gradient">Lab</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationsSheet />
          <Button variant="glass" size="icon-touch" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="min-h-5 text-sm text-muted-foreground" suppressHydrationWarning>
            {date ? date.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' }) : '\u00a0'}
          </p>
          <h1 className="text-[26px] leading-tight font-bold text-balance">
            {date ? greeting(date.getHours()) : 'Welcome back'}, <span className="text-gradient">scientist</span>
          </h1>
        </div>
        <SyncIndicator className="shrink-0" />
      </div>
    </header>
  )
}
