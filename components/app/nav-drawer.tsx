'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { NAV_SECTIONS, isActive } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { useApp } from './app-providers'
import { SyncIndicator } from './sync-indicator'

export function NavDrawer() {
  const { drawerOpen, setDrawerOpen } = useApp()
  const pathname = usePathname()

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent side="left" className="w-[86%] max-w-sm gap-0 border-white/10 bg-sidebar p-0">
        <SheetHeader className="relative overflow-hidden border-b border-white/10 p-5">
          <div className="pointer-events-none absolute -top-16 -left-10 size-48 rounded-full bg-accent/30 blur-3xl" aria-hidden="true" />
          <div className="relative flex items-center gap-3">
            <Image
              src="/images/lottolab-logo.png"
              alt=""
              width={56}
              height={56}
              className="size-12 rounded-xl object-cover"
            />
            <div className="flex flex-col">
              <SheetTitle className="font-heading text-xl font-bold">
                Lotto<span className="text-gradient">Lab</span>
              </SheetTitle>
              <SheetDescription className="text-xs">Your lottery research laboratory</SheetDescription>
            </div>
          </div>
          <div className="relative mt-3">
            <SyncIndicator />
          </div>
        </SheetHeader>

        <nav aria-label="All sections" className="no-scrollbar flex-1 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                {section.title}
              </p>
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const active = isActive(pathname, item.href)
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary/12 text-primary ring-1 ring-primary/25'
                            : 'text-foreground/85 hover:bg-white/5 hover:text-foreground',
                        )}
                      >
                        <span className={cn('grid size-8 place-items-center rounded-lg', active ? 'bg-primary/20' : 'bg-white/5')}>
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
          <p className="px-3 pb-4 text-xs leading-relaxed text-muted-foreground">
            LottoLab is an independent research tool and is not affiliated with the National Lottery or Ithuba. Play
            responsibly. 18+ only.
          </p>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
