'use client'

import { useSyncExternalStore } from 'react'
import type { GameId } from '@/lib/lottery/games'

/**
 * On-device cache for the user's own lottery activity.
 * Swap `persist`/`load` for calls to the LottoLab backend to sync across devices.
 */

export interface SavedCombination {
  id: string
  gameId: GameId
  main: number[]
  bonus: number | null
  label: string
  createdAt: number
}

export interface CheckedTicket {
  id: string
  gameId: GameId
  main: number[]
  bonus: number | null
  drawId: string
  drawDate: string
  mainMatches: number
  bonusMatched: boolean
  division: number | null
  prize: number | null
  checkedAt: number
}

export interface SpendEntry {
  id: string
  gameId: GameId
  amount: number
  boards: number
  date: string
  note: string
}

export interface UserState {
  saved: SavedCombination[]
  tickets: CheckedTicket[]
  spending: SpendEntry[]
  monthlyBudget: number
}

const STORAGE_KEY = 'lottolab:user:v1'
const EMPTY: UserState = { saved: [], tickets: [], spending: [], monthlyBudget: 200 }

let state: UserState = EMPTY
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) state = { ...EMPTY, ...JSON.parse(raw) }
  } catch {
    state = EMPTY
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* storage full or unavailable; keep in memory */
  }
}

function setState(updater: (s: UserState) => UserState) {
  load()
  state = updater(state)
  persist()
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  load()
  return state
}

export function useUserStore() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY)
}

export const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`)

export const userActions = {
  saveCombination(entry: Omit<SavedCombination, 'id' | 'createdAt'>) {
    const item = { ...entry, id: uid(), createdAt: Date.now() }
    setState((s) => ({ ...s, saved: [item, ...s.saved] }))
    return item
  },
  removeCombination(id: string) {
    setState((s) => ({ ...s, saved: s.saved.filter((c) => c.id !== id) }))
  },
  addTicket(entry: Omit<CheckedTicket, 'id' | 'checkedAt'>) {
    const item = { ...entry, id: uid(), checkedAt: Date.now() }
    setState((s) => ({ ...s, tickets: [item, ...s.tickets].slice(0, 200) }))
    return item
  },
  removeTicket(id: string) {
    setState((s) => ({ ...s, tickets: s.tickets.filter((t) => t.id !== id) }))
  },
  addSpend(entry: Omit<SpendEntry, 'id'>) {
    setState((s) => ({ ...s, spending: [{ ...entry, id: uid() }, ...s.spending] }))
  },
  removeSpend(id: string) {
    setState((s) => ({ ...s, spending: s.spending.filter((e) => e.id !== id) }))
  },
  setBudget(amount: number) {
    setState((s) => ({ ...s, monthlyBudget: amount }))
  },
}
