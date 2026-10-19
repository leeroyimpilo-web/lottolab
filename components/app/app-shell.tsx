import type { ReactNode } from 'react'
import { BottomNav } from './bottom-nav'
import { NavDrawer } from './nav-drawer'
import { OfflineBanner } from './offline-banner'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[680px] -translate-x-1/2 rounded-full bg-accent/25 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 size-[420px] rounded-full bg-primary/12 blur-[120px]" />
        <div className="absolute bottom-0 -left-32 size-[380px] rounded-full bg-chart-3/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(oklch(1_0_0/0.025)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0/0.025)_1px,transparent_1px)] bg-size-[32px_32px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      </div>
      <OfflineBanner />
      <main className="mx-auto flex w-full max-w-lg flex-col px-4 pb-32">{children}</main>
      <BottomNav />
      <NavDrawer />
    </div>
  )
}
