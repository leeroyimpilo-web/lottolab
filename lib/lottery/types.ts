import type { GameId } from './games'

/** Where a piece of data came from — shown to the user so they never mistake demo data for official results. */
export type DataProvenance = 'verified' | 'demo' | 'unavailable'

export interface PrizeDivision {
  division: number
  match: string
  winners: number | null
  payout: number | null
  odds: number
}

export interface Draw {
  id: string
  gameId: GameId
  drawNumber: number
  date: string
  main: number[]
  bonus: number | null
  jackpot: number | null
  nextJackpot: number | null
  rolledOver: boolean
  divisions: PrizeDivision[]
  provenance: DataProvenance
}

export interface DataSourceInfo {
  name: string
  provenance: DataProvenance
  connected: boolean
  description: string
}
