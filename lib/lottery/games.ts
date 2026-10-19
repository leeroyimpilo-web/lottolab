export type GameId =
  | 'lotto'
  | 'lotto-plus-1'
  | 'lotto-plus-2'
  | 'powerball'
  | 'powerball-plus'
  | 'daily-lotto'

export type BonusKind = 'bonus' | 'powerball' | 'none'

export interface GameDefinition {
  id: GameId
  name: string
  shortName: string
  family: 'lotto' | 'powerball' | 'daily'
  mainCount: number
  mainMax: number
  bonusKind: BonusKind
  /** Bonus ball range. For Lotto the bonus comes from the same pool as the main balls. */
  bonusMax: number
  /** 0 = Sunday … 6 = Saturday */
  drawDays: number[]
  drawTime: string
  boardPrice: number
  tagline: string
}

export const GAMES: GameDefinition[] = [
  {
    id: 'lotto',
    name: 'Lotto',
    shortName: 'Lotto',
    family: 'lotto',
    mainCount: 6,
    mainMax: 52,
    bonusKind: 'bonus',
    bonusMax: 52,
    drawDays: [3, 6],
    drawTime: '20:57',
    boardPrice: 5,
    tagline: 'Pick 6 from 52 plus a Bonus Ball',
  },
  {
    id: 'lotto-plus-1',
    name: 'Lotto Plus 1',
    shortName: 'Plus 1',
    family: 'lotto',
    mainCount: 6,
    mainMax: 52,
    bonusKind: 'bonus',
    bonusMax: 52,
    drawDays: [3, 6],
    drawTime: '20:57',
    boardPrice: 2.5,
    tagline: 'A second chance with your Lotto numbers',
  },
  {
    id: 'lotto-plus-2',
    name: 'Lotto 5 Max',
    shortName: '5 Max',
    family: 'lotto',
    mainCount: 6,
    mainMax: 52,
    bonusKind: 'bonus',
    bonusMax: 52,
    drawDays: [3, 6],
    drawTime: '20:57',
    boardPrice: 2.5,
    tagline: 'Current add-on replacing Lotto Plus 2 in June 2026',
  },
  {
    id: 'powerball',
    name: 'PowerBall',
    shortName: 'PowerBall',
    family: 'powerball',
    mainCount: 5,
    mainMax: 50,
    bonusKind: 'powerball',
    bonusMax: 16,
    drawDays: [2, 5],
    drawTime: '21:00',
    boardPrice: 10,
    tagline: 'Pick 5 from 50 plus a PowerBall from 16',
  },
  {
    id: 'powerball-plus',
    name: 'PowerBall XTRA',
    shortName: 'XTRA',
    family: 'powerball',
    mainCount: 5,
    mainMax: 50,
    bonusKind: 'powerball',
    bonusMax: 16,
    drawDays: [2, 5],
    drawTime: '21:00',
    boardPrice: 5,
    tagline: 'Current add-on replacing PowerBall Plus in June 2026',
  },
  {
    id: 'daily-lotto',
    name: 'Daily Lotto',
    shortName: 'Daily',
    family: 'daily',
    mainCount: 5,
    mainMax: 36,
    bonusKind: 'none',
    bonusMax: 0,
    drawDays: [0, 1, 2, 3, 4, 5, 6],
    drawTime: '21:00',
    boardPrice: 3,
    tagline: 'Pick 5 from 36, drawn every night',
  },
]

export const DEFAULT_GAME: GameId = 'lotto'

export function getGame(id: GameId): GameDefinition {
  return GAMES.find((g) => g.id === id) ?? GAMES[0]
}

export function isGameId(value: unknown): value is GameId {
  return typeof value === 'string' && GAMES.some((g) => g.id === value)
}

export function bonusLabel(game: GameDefinition) {
  if (game.bonusKind === 'powerball') return 'PowerBall'
  if (game.bonusKind === 'bonus') return 'Bonus Ball'
  return null
}

export function nextDrawDate(game: GameDefinition, from: Date = new Date()): Date {
  const [h, m] = game.drawTime.split(':').map(Number)
  for (let i = 0; i < 8; i++) {
    const d = new Date(from)
    d.setDate(from.getDate() + i)
    d.setHours(h, m, 0, 0)
    if (game.drawDays.includes(d.getDay()) && d.getTime() > from.getTime()) return d
  }
  return from
}
