'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TicketCheck } from 'lucide-react'
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
      <SheetContent side="left" className="w-[87%] max-w-sm gap-0 border-border bg-card p-0">
        <SheetHeader className="border-b border-border p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-primary text-white"><TicketCheck className="size-6" /></span>
            <div>
              <SheetTitle className="font-heading text-xl font-extrabold">Lotto<span className="text-primary">Lab</span></SheetTitle>
              <SheetDescription className="text-xs">Results & lottery intelligence</SheetDescription>
            </div>
          </div>
          <div className="mt-3"><SyncIndicator /></div>
        </SheetHeader>
        <nav aria-label="LottoLab feature menu" className="no-scrollbar flex-1 overflow-y-auto px-3 py-3">
          {NAV_SECTIONS.map(section => (
            <div className="mb-4" key={section.title}>
              <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{section.title}</p>
              <ul className="grid gap-0.5">
                {section.items.map(item => {
                  const active = isActive(pathname, item.href)
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link href={item.href} onClick={() => setDrawerOpen(false)} aria-current={active ? 'page' : undefined}
                        className={cn('flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium', active ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted')}>
                        <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
          <p className="px-3 pb-5 text-xs leading-relaxed text-muted-foreground">
            LottoLab is independent of the National Lottery. Past draws do not predict future random results. Play responsibly. 18+.
          </p>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
