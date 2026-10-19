'use client'

import { CloudOff, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { formatRelative } from '@/lib/format'
import { useOnline, useSyncState } from '@/lib/store/sync-store'
import { cn } from '@/lib/utils'

export function SyncIndicator({ className }: { className?: string }) {
  const online = useOnline()
  const sync = useSyncState()
  const syncing = sync.status === 'syncing'

  return (
    <Link
      href="/info/updates"
      className={cn(
        'inline-flex min-h-8 items-center gap-1.5 rounded-full bg-white/5 px-2.5 text-[11px] font-medium text-muted-foreground ring-1 ring-white/10 transition-colors hover:text-foreground',
        className,
      )}
      aria-label={online ? `Data synced ${formatRelative(sync.lastSync)}. Open data updates.` : 'Offline. Open data updates.'}
    >
      {online ? (
        <>
          <span className="relative flex size-2">
            {syncing && <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />}
            <span className={cn('relative inline-flex size-2 rounded-full', syncing ? 'bg-primary' : 'bg-success')} />
          </span>
          {syncing ? (
            <span className="flex items-center gap-1">
              <RefreshCw className="size-3 animate-spin" aria-hidden="true" />
              Updating
            </span>
          ) : (
            <span suppressHydrationWarning>Synced {formatRelative(sync.lastSync).toLowerCase()}</span>
          )}
        </>
      ) : (
        <>
          <CloudOff className="size-3.5 text-bonus" aria-hidden="true" />
          Offline mode
        </>
      )}
    </Link>
  )
}
