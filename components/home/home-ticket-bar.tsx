'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ScanLine } from 'lucide-react'

export function HomeTicketBar() {
  if (usePathname() !== '/') return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))]">
      <Link href="/check" className="mx-auto flex min-h-13 max-w-xl items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-heading font-bold text-primary-foreground">
        <ScanLine className="size-5" aria-hidden="true" />Check Ticket
      </Link>
    </div>
  )
}
