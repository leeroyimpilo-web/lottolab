'use client'
import Link from 'next/link'
import { Menu, RefreshCw, TicketCheck } from 'lucide-react'
import { useApp } from '@/components/app/app-providers'
import { NotificationsSheet } from '@/components/home/notifications-sheet'
import { useNow } from '@/hooks/use-now'
import { syncNow, useOnline, useSyncState } from '@/lib/store/sync-store'

export function HomeHeader() {
  const { setDrawerOpen } = useApp()
  const now = useNow()
  const online = useOnline()
  const sync = useSyncState()
  const syncing = sync.status === 'syncing'
  return (
    <header className="sticky top-0 z-30 -mx-4 border-b border-border bg-card px-4 pt-[calc(10px+env(safe-area-inset-top))] pb-3">
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open features menu"
          className="grid size-10 shrink-0 place-items-center rounded-xl hover:bg-muted">
          <Menu className="size-6" aria-hidden="true" />
        </button>
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-white" aria-hidden="true"><TicketCheck className="size-5" /></span>
          <span className="min-w-0">
            <span className="block font-heading text-lg font-extrabold leading-5">Lotto<span className="text-primary">Lab</span></span>
            <span className="block truncate text-[11px] text-muted-foreground" suppressHydrationWarning>
              {now ? new Date(now).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'South African lotto'}
            </span>
          </span>
        </Link>
        <button type="button" onClick={() => void syncNow()} disabled={!online || syncing}
          aria-label={syncing ? 'Updating draw results' : 'Update draw results'} title={online ? 'Refresh latest draws' : 'Offline'}
          className="grid size-10 shrink-0 place-items-center rounded-xl hover:bg-muted disabled:opacity-40">
          <RefreshCw className={syncing ? 'size-5 animate-spin' : 'size-5'} aria-hidden="true" />
        </button>
        <NotificationsSheet />
      </div>
    </header>
  )
}
