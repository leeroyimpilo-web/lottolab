'use client'

import { motion } from 'motion/react'
import { ChevronRight, History, ScanSearch, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const ACTIONS = [
  {
    href: '/generate',
    title: 'Generate My Numbers',
    description: 'Fresh combinations in one tap',
    icon: Sparkles,
    tone: 'from-primary/30 to-primary/5 text-primary',
  },
  {
    href: '/check',
    title: 'Check My Numbers',
    description: 'See if your ticket won',
    icon: ScanSearch,
    tone: 'from-success/30 to-success/5 text-success',
  },
  {
    href: '/lab/history',
    title: 'Explore Past Results',
    description: 'Every draw, searchable',
    icon: History,
    tone: 'from-accent/40 to-accent/5 text-chart-3',
  },
]

export function QuickActions() {
  return (
    <section aria-label="Quick actions" className="flex flex-col gap-2.5">
      {ACTIONS.map((action, i) => (
        <motion.div
          key={action.href}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + i * 0.06 }}
        >
          <Link
            href={action.href}
            className="glass group flex min-h-18 items-center gap-3.5 rounded-2xl p-3 pr-4 transition-transform active:scale-[0.98]"
          >
            <span className={cn('grid size-12 shrink-0 place-items-center rounded-xl bg-linear-to-br ring-1 ring-white/10', action.tone)}>
              <action.icon className="size-6" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-heading text-[15px] font-semibold">{action.title}</span>
              <span className="text-xs text-muted-foreground">{action.description}</span>
            </span>
            <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </motion.div>
      ))}
    </section>
  )
}
