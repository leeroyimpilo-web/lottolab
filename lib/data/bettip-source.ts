'use client'

import { GAMES, type GameId, getGame } from '@/lib/lottery/games'
import type { Draw } from '@/lib/lottery/types'
import type { LotteryDataSource, RefreshResult } from './source'

/**
 * BetTip republishes SA National Lottery results with an open, attribution-required feed.
 * This is a THIRD-PARTY archive, not an official National Lottery API.
 * The adapter never invents jackpots, draw numbers, winners or prize payments.
 *
 * Results from before 2026-06-01 have different game rules. Keep this first
 * production release within the current rules era so its statistics and
 * number generators do not silently mix incompatible number pools.
 */
const BASE = 'https://bettip.co.za/api/v1/lotto'
const ERA_START = '2026-06-01'
const DB_NAME = 'lottolab-results'
const STORE_NAME = 'draw-cache'
const CACHE_KEY = 'bettip-current-era-v1'

type FeedRow = {
  game?: unknown
  date?: unknown
  numbers?: unknown
  bonusBall?: unknown
  verified?: unknown
  official?: unknown
  drawNumber?: unknown
  drawId?: unknown
}
type FeedResponse = { data?: unknown }
type CacheRecord = { key: string; draws: Draw[]; savedAt: number }

const supported: Record<string, GameId> = {
  'lotto': 'lotto',
  'lotto-plus-1': 'lotto-plus-1',
  'lotto-5-max': 'lotto-plus-2',
  'powerball': 'powerball',
  'powerball-plus': 'powerball-plus', // The provider uses the legacy key for PowerBall XTRA.
  'powerball-xtra': 'powerball-plus',
  'daily-lotto': 'daily-lotto',
}

let inMemory: Draw[] | null = null
let cachePromise: Promise<Draw[]> | null = null
let refreshPromise: Promise<RefreshResult> | null = null

function openCache(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB not available'))
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function readCache(): Promise<Draw[]> {
  try {
    const db = await openCache()
    return await new Promise<Draw[]>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const request = tx.objectStore(STORE_NAME).get(CACHE_KEY)
      request.onsuccess = () => {
        const record = request.result as CacheRecord | undefined
        resolve(Array.isArray(record?.draws) ? record.draws : [])
      }
      request.onerror = () => resolve([])
      tx.oncomplete = () => db.close()
    })
  } catch {
    return []
  }
}

async function writeCache(draws: Draw[]): Promise<void> {
  try {
    const db = await openCache()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put({ key: CACHE_KEY, draws, savedAt: Date.now() } satisfies CacheRecord)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    db.close()
  } catch {
    // Browser quota / private mode may disable persistence. Live results remain usable.
  }
}

async function bundledDraws(): Promise<Draw[]> {
  // In the Android APK this JSON file is included inside the application
  // and is readable without mobile data or Wi-Fi from its first launch.
  try {
    const response = await fetch('/data/lotto-seed.json')
    if (!response.ok) return []
    return parseFeedRows(await response.json())
  } catch {
    return []
  }
}

async function cachedDraws(): Promise<Draw[]> {
  if (inMemory) return inMemory
  if (!cachePromise) {
    cachePromise = (async () => {
      const stored = await readCache()
      const bundled = await bundledDraws()
      const draws = mergeDraws(bundled, stored)
      inMemory = draws
      if (draws.length && !stored.length) void writeCache(draws)
      return draws
    })()
  }
  return cachePromise
}

async function fetchFeed(path: 'draws' | 'latest'): Promise<unknown> {
  const response = await fetch(`${BASE}/${path}.json`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(25000),
  })
  if (!response.ok) throw new Error(`BetTip ${path}: HTTP ${response.status}`)
  const json = (await response.json()) as FeedResponse
  if (!json || !('data' in json)) throw new Error('Unexpected BetTip response')
  return json.data
}

function parseRow(value: unknown): Draw | null {
  if (!value || typeof value !== 'object') return null
  const row = value as FeedRow
  if (typeof row.game !== 'string' || !Object.hasOwn(supported, row.game)) return null
  const gameId = supported[row.game]
  const game = getGame(gameId)
  if (typeof row.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.date) || row.date < ERA_START) return null
  if (!Number.isFinite(Date.parse(row.date))) return null
  if (!Array.isArray(row.numbers) || row.numbers.length !== game.mainCount) return null
  const main = row.numbers
  if (!main.every((n): n is number => Number.isInteger(n) && n >= 1 && n <= game.mainMax)) return null
  if (new Set(main).size !== main.length) return null
  const bonus = row.bonusBall === null || row.bonusBall === undefined ? null : row.bonusBall
  if (game.bonusKind !== 'none') {
    if (!Number.isInteger(bonus) || (bonus as number) < 1 || (bonus as number) > game.bonusMax) return null
    if (game.bonusKind === 'bonus' && main.includes(bonus as number)) return null
  } else if (bonus !== null) {
    return null
  }

  const drawNumber = Number(row.drawNumber ?? row.drawId)
  // Missing draw numbers must NEVER be replaced with invented ones.
  return {
    id: `${gameId}-${row.date}`,
    gameId,
    drawNumber: Number.isSafeInteger(drawNumber) && drawNumber > 0 ? drawNumber : 0,
    date: `${row.date}T12:00:00+02:00`,
    main: [...main].sort((a, b) => a - b),
    bonus: bonus as number | null,
    jackpot: null,
    nextJackpot: null,
    rolledOver: false,
    divisions: [],
    provenance: row.verified === true && row.official === true ? 'verified' : 'unavailable',
  }
}

function parseFeedRows(value: unknown): Draw[] {
  if (!Array.isArray(value)) return []
  return value.map(parseRow).filter((row): row is Draw => row !== null)
}

function parseLatest(value: unknown): Draw[] {
  if (!value || typeof value !== 'object') return []
  const feed = value as { byGame?: unknown; recent?: unknown }
  const byGame = feed.byGame && typeof feed.byGame === 'object' ? Object.values(feed.byGame) : []
  return parseFeedRows([...byGame, ...(Array.isArray(feed.recent) ? feed.recent : [])])
}

function mergeDraws(...groups: Draw[][]): Draw[] {
  const results = new Map<string, Draw>()
  // Prefer verified entries if a newer, possibly unconfirmed entry is duplicated.
  for (const group of groups) {
    for (const draw of group) {
      const existing = results.get(draw.id)
      if (!existing || draw.provenance === 'verified' || existing.provenance !== 'verified') {
        results.set(draw.id, draw)
      }
    }
  }
  return [...results.values()].sort((a, b) => b.date.localeCompare(a.date) || a.gameId.localeCompare(b.gameId))
}

function allResultsCount(draws: Draw[]): number {
  return draws.filter((draw) => GAMES.some((game) => game.id === draw.gameId)).length
}

export const bettipSource: LotteryDataSource = {
  info: {
    name: 'BetTip SA Lottery Results',
    provenance: 'verified',
    connected: true,
    description: 'Third-party published results, credited to BetTip. Data is cached on your device. Some new games and prize details are not provided by this feed.',
  },

  async getDraws(gameId) {
    let draws = await cachedDraws()
    if (!draws.length && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        await bettipSource.refresh()
        draws = await cachedDraws()
      } catch {
        // No fabricated offline fallback. Show an explicit unavailable state.
      }
    }
    return draws.filter((draw) => draw.gameId === gameId)
  },

  async refresh() {
    if (refreshPromise) return refreshPromise
    refreshPromise = (async () => {
      // Keep the last good cache intact if either endpoint fails.
      const [archive, latest] = await Promise.all([fetchFeed('draws'), fetchFeed('latest')])
      const archiveDraws = parseFeedRows(archive)
      const latestDraws = parseLatest(latest)
      if (archiveDraws.length === 0 && latestDraws.length === 0) {
        throw new Error('No valid South African draw results received')
      }
      const previous = await cachedDraws()
      const draws = mergeDraws(previous, archiveDraws, latestDraws)
      inMemory = draws
      await writeCache(draws)
      return { ok: true, liveSourceConnected: true, totalDraws: allResultsCount(draws) }
    })()
    try {
      return await refreshPromise
    } finally {
      refreshPromise = null
    }
  },
}
