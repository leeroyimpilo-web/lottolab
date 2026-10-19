import type { GameDefinition } from './games'
import type { Draw } from './types'

export interface NumberStat {
  number: number
  count: number
  /** Draws since this number last appeared. */
  gap: number
  lastSeen: string | null
}

export function frequency(game: GameDefinition, draws: Draw[]): NumberStat[] {
  const stats: NumberStat[] = Array.from({ length: game.mainMax }, (_, i) => ({
    number: i + 1,
    count: 0,
    gap: draws.length,
    lastSeen: null,
  }))
  draws.forEach((draw, idx) => {
    for (const n of draw.main) {
      const s = stats[n - 1]
      s.count++
      if (s.lastSeen === null) {
        s.lastSeen = draw.date
        s.gap = idx
      }
    }
  })
  return stats
}

export function bonusFrequency(game: GameDefinition, draws: Draw[]) {
  if (game.bonusKind === 'none') return []
  const counts = Array.from({ length: game.bonusMax }, (_, i) => ({ number: i + 1, count: 0 }))
  for (const d of draws) if (d.bonus) counts[d.bonus - 1].count++
  return counts
}

export function hotCold(game: GameDefinition, draws: Draw[], window = 30, size = 6) {
  const recent = frequency(game, draws.slice(0, window))
  const sorted = [...recent].sort((a, b) => b.count - a.count || a.number - b.number)
  const overdue = [...frequency(game, draws)].sort((a, b) => b.gap - a.gap).slice(0, size)
  return {
    hot: sorted.slice(0, size),
    cold: sorted.slice(-size).reverse(),
    overdue,
    window,
  }
}

export function oddEven(draws: Draw[]) {
  const splits = new Map<string, number>()
  let odd = 0
  let even = 0
  for (const d of draws) {
    const o = d.main.filter((n) => n % 2 === 1).length
    odd += o
    even += d.main.length - o
    const key = `${o} odd · ${d.main.length - o} even`
    splits.set(key, (splits.get(key) ?? 0) + 1)
  }
  return {
    odd,
    even,
    splits: [...splits.entries()]
      .map(([split, count]) => ({ split, count, oddCount: Number(split[0]) }))
      .sort((a, b) => b.oddCount - a.oddCount),
  }
}

export function rangeDistribution(game: GameDefinition, draws: Draw[]) {
  const buckets: { range: string; from: number; to: number; count: number }[] = []
  for (let from = 1; from <= game.mainMax; from += 10) {
    const to = Math.min(from + 9, game.mainMax)
    buckets.push({ range: `${from}–${to}`, from, to, count: 0 })
  }
  for (const d of draws) for (const n of d.main) buckets[Math.floor((n - 1) / 10)].count++
  return buckets
}

export function consecutiveStats(draws: Draw[]) {
  let withPair = 0
  const pairs = new Map<string, number>()
  for (const d of draws) {
    let found = false
    for (let i = 1; i < d.main.length; i++) {
      if (d.main[i] - d.main[i - 1] === 1) {
        found = true
        const key = `${d.main[i - 1]}–${d.main[i]}`
        pairs.set(key, (pairs.get(key) ?? 0) + 1)
      }
    }
    if (found) withPair++
  }
  return {
    withPair,
    total: draws.length,
    topPairs: [...pairs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
  }
}

export function sumDistribution(draws: Draw[], bucketSize = 20) {
  const map = new Map<number, number>()
  let total = 0
  for (const d of draws) {
    const sum = d.main.reduce((s, n) => s + n, 0)
    total += sum
    const b = Math.floor(sum / bucketSize) * bucketSize
    map.set(b, (map.get(b) ?? 0) + 1)
  }
  return {
    average: draws.length ? total / draws.length : 0,
    buckets: [...map.entries()].sort((a, b) => a[0] - b[0]).map(([from, count]) => ({ range: `${from}`, count })),
  }
}

export function combinationOccurrences(draws: Draw[], numbers: number[]) {
  if (numbers.length === 0) return { exact: [], best: [] as { draw: Draw; matches: number }[] }
  const scored = draws.map((draw) => ({ draw, matches: draw.main.filter((n) => numbers.includes(n)).length }))
  return {
    exact: scored.filter((s) => s.matches === numbers.length).map((s) => s.draw),
    best: scored.sort((a, b) => b.matches - a.matches).slice(0, 5),
  }
}

export function matchCountDistribution(draws: Draw[], numbers: number[]) {
  const counts = new Map<number, number>()
  for (const d of draws) {
    const m = d.main.filter((n) => numbers.includes(n)).length
    counts.set(m, (counts.get(m) ?? 0) + 1)
  }
  return counts
}
