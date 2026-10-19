import { ChevronRight, FlaskConical, Info, ShieldCheck, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { DataProvenance } from '@/lib/lottery/types'
import { cn } from '@/lib/utils'

export function SectionHeading({ id, title, href, linkLabel = 'See all', className }: { id?: string; title: string; href?: string; linkLabel?: string; className?: string }) {
  return (
    <div className={cn('flex items-end justify-between gap-2', className)}>
      <h2 id={id} className="text-lg font-semibold">{title}</h2>
      {href && (
        <Link href={href} className="flex min-h-11 items-center gap-0.5 text-sm font-medium text-primary hover:underline">
          {linkLabel}
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}

const PROVENANCE = {
  verified: { label: 'Verified result', icon: ShieldCheck, className: 'bg-success/15 text-success ring-success/30' },
  demo: { label: 'Demo data', icon: FlaskConical, className: 'bg-bonus/15 text-bonus ring-bonus/30' },
  unavailable: { label: 'Not available', icon: TriangleAlert, className: 'bg-white/5 text-muted-foreground ring-white/10' },
} as const

export function ProvenanceBadge({ provenance, className }: { provenance: DataProvenance; className?: string }) {
  const p = PROVENANCE[provenance]
  const Icon = p.icon
  return (
    <span className={cn('inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-semibold ring-1', p.className, className)}>
      <Icon className="size-3" aria-hidden="true" />
      {p.label}
    </span>
  )
}

export function Panel({ children, className, as: Tag = 'section' }: { children: ReactNode; className?: string; as?: 'section' | 'div' | 'article' }) {
  return <Tag className={cn('glass metal-edge relative rounded-3xl p-4', className)}>{children}</Tag>
}

export function RandomnessNote({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <Alert className={cn('border-primary/20 bg-primary/5', className)}>
      <Info aria-hidden="true" />
      <AlertTitle>Every draw is random</AlertTitle>
      <AlertDescription>
        {children ??
          'Past results describe what has happened. They cannot predict the next draw — every valid combination has exactly the same chance of winning.'}
      </AlertDescription>
    </Alert>
  )
}

export function StatTile({ label, value, hint, className }: { label: string; value: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/[0.07]', className)}>
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <span className="font-heading text-xl font-bold tabular-nums">{value}</span>
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  )
}
