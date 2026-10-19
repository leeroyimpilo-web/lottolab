import type { GameId } from '@/lib/lottery/games'
import type { DataSourceInfo, Draw } from '@/lib/lottery/types'

export interface RefreshResult {
  ok: boolean
  liveSourceConnected: boolean
  totalDraws: number
}

/**
 * Contract between the UI and any lottery data provider.
 * Implement this against the LottoLab Android backend / API and swap it in `repository.ts`.
 */
export interface LotteryDataSource {
  info: DataSourceInfo
  /** Draw history for a game, newest first. */
  getDraws(gameId: GameId): Promise<Draw[]>
  refresh(): Promise<RefreshResult>
}
