import { GAMES, getGame, type GameId } from '@/lib/lottery/games'
import { divisionProbability, divisionOdds, divisionRules } from '@/lib/lottery/odds'
import { drawUnique, hashString, mulberry32 } from '@/lib/lottery/random'
import type { Draw, PrizeDivision } from '@/lib/lottery/types'
import type { LotteryDataSource } from './source'

/**
 * DEMONSTRATION DATA ONLY.
 * Draws are produced by a seeded random generator so the interface can be explored offline.
 * They are not official National Lottery results. Replace this source with the LottoLab backend.
 */
const ANCHOR_DATE = new Date('2026-10-18T21:00:00+02:00')

const HISTORY_SIZE: Record<GameId, number> = {
  lotto: 520,
  'lotto-plus-1': 520,
  'lotto-plus-2': 520,
  powerball: 520,
  'powerball-plus': 520,
  'daily-lotto': 900,
}

const BASE_JACKPOT: Record<GameId, number> = {
  lotto: 2_000_000,
  'lotto-plus-1': 1_000_000,
  'lotto-plus-2': 500_000,
  powerball: 3_000_000,
  'powerball-plus': 1_000_000,
  'daily-lotto': 400_000,
}

const BOARDS_PER_DRAW: Record<GameId, number> = {
  lotto: 3_800_000,
  'lotto-plus-1': 2_600_000,
  'lotto-plus-2': 2_100_000,
  powerball: 5_400_000,
  'powerball-plus': 3_200_000,
  'daily-lotto': 1_300_000,
}

const FIXED_PAYOUTS: Record<string, number[]> = {
  lotto: [0, 125_000, 6_500, 2_800, 180, 110, 50, 20],
  powerball: [0, 135_000, 18_000, 1_200, 420, 50, 30, 15, 10],
  daily: [0, 2_400, 25, 6],
}

const cache = new Map<GameId, Draw[]>()

function drawDates(gameId: GameId, count: number): Date[] {
  const game = getGame(gameId)
  const dates: Date[] = []
  const cursor = new Date(ANCHOR_DATE)
  while (dates.length < count) {
    if (game.drawDays.includes(cursor.getDay())) dates.push(new Date(cursor))
    cursor.setDate(cursor.getDate() - 1)
  }
  return dates
}

function buildHistory(gameId: GameId): Draw[] {
  const game = getGame(gameId)
  const rand = mulberry32(hashString(`lottolab-demo-${gameId}`))
  const dates = drawDates(gameId, HISTORY_SIZE[gameId]).reverse()
  const rules = divisionRules(game)
  const payouts = FIXED_PAYOUTS[game.family]
  const firstDrawNumber = 1800 + Math.floor(rand() * 400)

  let jackpot = BASE_JACKPOT[gameId]
  const draws: Draw[] = []

  dates.forEach((date, i) => {
    const main = drawUnique(game.mainCount, game.mainMax, rand)
    let bonus: number | null = null
    if (game.bonusKind === 'bonus') bonus = drawUnique(1, game.mainMax, rand, main)[0]
    if (game.bonusKind === 'powerball') bonus = Math.floor(rand() * game.bonusMax) + 1

    const sales = BOARDS_PER_DRAW[gameId] * (0.85 + rand() * 0.3)
    const divisions: PrizeDivision[] = rules.map((rule, idx) => {
      const expected = sales * divisionProbability(game, rule)
      const winners = idx === 0 ? (rand() < Math.min(0.9, expected) ? 1 : 0) : Math.max(0, Math.round(expected * (0.75 + rand() * 0.5)))
      const payout = idx === 0 ? (winners > 0 ? jackpot : 0) : Math.round(payouts[idx] * (0.8 + rand() * 0.4) * 100) / 100
      return {
        division: rule.division,
        match: rule.label,
        winners,
        payout,
        odds: divisionOdds(game, rule),
      }
    })

    const won = (divisions[0].winners ?? 0) > 0
    const currentJackpot = Math.round(jackpot / 1000) * 1000
    const next = won ? BASE_JACKPOT[gameId] : Math.round((jackpot + sales * 0.6 * (0.8 + rand() * 0.4)) / 100_000) * 100_000

    draws.push({
      id: `${gameId}-${firstDrawNumber + i}`,
      gameId,
      drawNumber: firstDrawNumber + i,
      date: date.toISOString(),
      main,
      bonus,
      jackpot: currentJackpot,
      nextJackpot: next,
      rolledOver: !won,
      divisions,
      provenance: 'demo',
    })
    jackpot = next
  })

  return draws.reverse()
}

function getHistory(gameId: GameId) {
  let history = cache.get(gameId)
  if (!history) {
    history = buildHistory(gameId)
    cache.set(gameId, history)
  }
  return history
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const demoSource: LotteryDataSource = {
  info: {
    name: 'LottoLab demonstration dataset',
    provenance: 'demo',
    connected: false,
    description:
      'Sample draws generated for previewing the app. These are not official results. Connect the LottoLab backend to load verified draws.',
  },
  async getDraws(gameId) {
    await wait(350)
    return getHistory(gameId)
  },
  async refresh() {
    await wait(1400)
    return {
      ok: true,
      liveSourceConnected: false,
      totalDraws: GAMES.reduce((s, g) => s + getHistory(g.id).length, 0),
    }
  },
}
