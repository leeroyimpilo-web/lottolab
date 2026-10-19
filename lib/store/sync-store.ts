'use client'

import { useSyncExternalStore } from 'react'
import { mutate } from 'swr'
import { dataSource } from '@/lib/data/repository'

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

export interface SyncState {
  status: SyncStatus
  lastSync: number | null
  message: string
  totalDraws: number | null
  liveSourceConnected: boolean
}

const STORAGE_KEY = 'lottolab:sync:v1'
const SERVER_STATE: SyncState = {
  status: 'idle',
  lastSync: null,
  message: '',
  totalDraws: null,
  liveSourceConnected: false,
}

let state: SyncState = SERVER_STATE
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      state = { ...state, lastSync: saved.lastSync ?? null, totalDraws: saved.totalDraws ?? null }
    }
  } catch {
    /* ignore */
  }
}

function set(patch: Partial<SyncState>) {
  state = { ...state, ...patch }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ lastSync: state.lastSync, totalDraws: state.totalDraws }))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

export function useSyncState() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => {
      load()
      return state
    },
    () => SERVER_STATE,
  )
}

function subscribeOnline(cb: () => void) {
  window.addEventListener('online', cb)
  window.addEventListener('offline', cb)
  return () => {
    window.removeEventListener('online', cb)
    window.removeEventListener('offline', cb)
  }
}

export function useOnline() {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true)
}

export async function syncNow() {
  load()
  if (state.status === 'syncing') return
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    set({ status: 'error', message: "You're offline. Saved data is still available, and we'll update when you reconnect." })
    return
  }
  set({ status: 'syncing', message: 'Checking for new draws…' })
  try {
    const result = await dataSource.refresh()
    await mutate((key) => Array.isArray(key) && key[0] === 'draws')
    set({
      status: 'success',
      lastSync: Date.now(),
      totalDraws: result.totalDraws,
      liveSourceConnected: result.liveSourceConnected,
      message: result.liveSourceConnected
        ? 'All draws are up to date.'
        : 'Demo data refreshed. No live results source is connected yet.',
    })
  } catch {
    set({ status: 'error', message: "We couldn't update right now. Your saved data is still available." })
  }
}

let autoSyncStarted = false
/** Sync once on launch and again whenever connectivity returns. */
export function startAutoSync() {
  if (autoSyncStarted || typeof window === 'undefined') return
  autoSyncStarted = true
  load()
  const stale = !state.lastSync || Date.now() - state.lastSync > 1000 * 60 * 60
  if (stale) void syncNow()
  window.addEventListener('online', () => void syncNow())
}
