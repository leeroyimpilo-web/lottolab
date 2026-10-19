'use client'

import { RefreshCw, WifiOff } from 'lucide-react'
import { useState } from 'react'
import { Panel } from '@/components/lotto/shared'
import { useAllDrawCounts } from '@/lib/data/repository'
import { useOnline, useSyncState, syncNow } from '@/lib/store/sync-store'

export default function UpdatesPage() {
  const online = useOnline()
  const sync = useSyncState()
  const count = useAllDrawCounts()
  const [requested, setRequested] = useState(false)

  async function update() {
    setRequested(true)
    try {
      await syncNow()
    } finally {
      setRequested(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 pt-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Data updates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          LottoLab downloads published results automatically when you open the app or reconnect to Wi-Fi or mobile data.
        </p>
      </div>
      <Panel className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Connection</p>
            <p className="text-lg font-bold">{online ? 'Online' : 'Offline'}</p>
          </div>
          {online ? <RefreshCw className="size-5 text-primary" /> : <WifiOff className="size-5 text-bonus" />}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xs text-muted-foreground">Results on device</p>
            <p className="text-xl font-bold">{count?.toLocaleString('en-ZA') ?? '—'}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xs text-muted-foreground">Last download</p>
            <p className="text-sm font-semibold">
              {sync.lastSync ? new Date(sync.lastSync).toLocaleString('en-ZA') : 'Not yet'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={update}
          disabled={!online || sync.status === 'syncing' || requested}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${sync.status === 'syncing' ? 'animate-spin' : ''}`} />
          {sync.status === 'syncing' ? 'Downloading results…' : 'Update now'}
        </button>
        <p role="status" className="text-sm text-muted-foreground">
          {sync.message || 'Connected data is cached on this device after the first successful download.'}
        </p>
      </Panel>
      <Panel>
        <h2 className="font-semibold">Where results come from</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          LottoLab uses the free BetTip results archive. Data is provided by an independent publisher,
          not directly by the National Lottery. The current source supplies Lotto, Lotto Plus 1,
          PowerBall, PowerBall XTRA and Daily Lotto. Lotto 5 Max, verified winnings and full prize
          divisions still need an additional source.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          To keep number analysis accurate, the initial live archive is limited to draws dated from
          1 June 2026, when the game rules changed. Older-era statistics will be added separately.
          No fabricated results or payouts are displayed.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          <a href="https://bettip.co.za/" className="underline" target="_blank" rel="noopener noreferrer">Data by BetTip</a>
          {' · '}
          <a href="https://www.nationallottery.co.za/" className="underline" target="_blank" rel="noopener noreferrer">National Lottery</a>
        </p>
      </Panel>
    </div>
  )
}
