'use client'

import useSWR from 'swr'
import { GAMES, type GameId } from '@/lib/lottery/games'
import type { Draw } from '@/lib/lottery/types'
import { demoSource } from './demo-source'
import type { LotteryDataSource } from './source'

/** Swap this for the production LottoLab data source. UI components never import a source directly. */
export const dataSource: LotteryDataSource = demoSource

export function useDraws(gameId: GameId) {
  const { data, error, isLoading, mutate } = useSWR<Draw[]>(['draws', gameId], () => dataSource.getDraws(gameId), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  })
  return { draws: data ?? [], latest: data?.[0] ?? null, error, isLoading: isLoading && !data, mutate }
}

export function useAllDrawCounts() {
  const { data } = useSWR(['draw-counts'], async () => {
    const all = await Promise.all(GAMES.map((g) => dataSource.getDraws(g.id)))
    return all.reduce((s, d) => s + d.length, 0)
  })
  return data ?? null
}
