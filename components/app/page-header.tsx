'use client'

import { ChevronLeft, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { useApp } from './app-providers'

interface PageHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
  back?: boolean
  action?: ReactNode
}

export function PageHeader({ title, subtitle, eyebrow, back, action }: PageHeaderProps) {
  const { setDrawerOpen } = useApp()
  const router = useRouter()

  return (
    <header className="flex flex-col gap-4 pt-4 pb-2">
      <div className="flex items-center justify-between gap-2">
        {back ? (
          <Button variant="glass" size="icon-touch" onClick={() => router.back()} aria-label="Go back">
            <ChevronLeft />
          </Button>
        ) : (
          <Button variant="glass" size="icon-touch" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
        )}
        <div className="flex items-center gap-2">{action}</div>
        {back && (
          <Button variant="glass" size="icon-touch" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {eyebrow && <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">{eyebrow}</p>}
        <h1 className="text-[28px] leading-tight font-bold">{title}</h1>
        {subtitle && <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{subtitle}</p>}
      </div>
    </header>
  )
}
