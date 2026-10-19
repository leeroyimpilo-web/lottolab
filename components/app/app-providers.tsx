'use client'

import { MotionConfig } from 'motion/react'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_GAME, getGame, type GameDefinition, type GameId } from '@/lib/lottery/games'
import { startAutoSync } from '@/lib/store/sync-store'

interface AppContextValue {
  gameId: GameId
  game: GameDefinition
  setGameId: (id: GameId) => void
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProviders({ children }: { children: ReactNode }) {
  const [gameId, setGameId] = useState<GameId>(DEFAULT_GAME)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    startAutoSync()
    if ('serviceWorker' in navigator && window.isSecureContext) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // App remains usable online if service workers are blocked.
      })
    }
  }, [])

  const value = useMemo(
    () => ({ gameId, game: getGame(gameId), setGameId, drawerOpen, setDrawerOpen }),
    [gameId, drawerOpen],
  )

  return (
    <MotionConfig reducedMotion="user">
      <AppContext.Provider value={value}>{children}</AppContext.Provider>
    </MotionConfig>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProviders')
  return ctx
}
