'use client'

import { motion } from 'motion/react'
import { useApp } from '@/components/app/app-providers'
import { GAMES } from '@/lib/lottery/games'
import { cn } from '@/lib/utils'

export function GameSelector({ className }: { className?: string }) {
  const { gameId, setGameId } = useApp()

  return (
    <div className={cn('-mx-4', className)}>
      <div role="radiogroup" aria-label="Choose a lottery game" className="no-scrollbar flex snap-x gap-2 overflow-x-auto px-4 py-1">
        {GAMES.map((game) => {
          const active = game.id === gameId
          return (
            <button
              key={game.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setGameId(game.id)}
              className={cn(
                'relative min-h-11 shrink-0 snap-start rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors',
                active ? 'text-primary-foreground' : 'bg-white/5 text-muted-foreground ring-1 ring-white/10 hover:text-foreground',
              )}
            >
              {active && (
                <motion.span
                  layoutId="game-selector-pill"
                  className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,var(--primary),var(--accent))] shadow-[0_4px_20px_-4px_var(--primary)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{game.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
