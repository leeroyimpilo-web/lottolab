import type { ReactNode } from 'react'
import { HomeHeader } from '@/components/home/home-header'
import { HomeTicketBar } from '@/components/home/home-ticket-bar'
import { NavDrawer } from './nav-drawer'
import { OfflineBanner } from './offline-banner'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <OfflineBanner />
      <div className="mx-auto max-w-xl px-4"><HomeHeader /></div>
      <main className="mx-auto flex w-full max-w-xl flex-col px-4 pt-4 pb-28">{children}</main>
      <HomeTicketBar />
      <NavDrawer />
    </div>
  )
}
