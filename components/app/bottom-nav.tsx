'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BOTTOM_NAV, isActive } from '@/lib/navigation'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg px-3 pb-safe"
    >
      <div className="glass-strong mb-2 flex items-stretch justify-between rounded-3xl px-1.5 py-1.5">
        {BOTTOM_NAV.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium transition-colors',
                active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-pill"
                  className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,var(--primary),var(--accent))] shadow-[0_6px_24px_-6px_var(--primary)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="relative size-5" aria-hidden="true" strokeWidth={active ? 2.4 : 1.8} />
              <span className="relative">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
