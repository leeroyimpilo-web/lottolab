'use client'

import { useState } from 'react'
import { useApp } from '@/components/app/app-providers'
import { GameSelector } from '@/components/lotto/game-selector'
import { BallRow } from '@/components/lotto/lotto-ball'
import { Panel, RandomnessNote } from '@/components/lotto/shared'
import { generateMany, type Combination } from '@/lib/lottery/generator'
import { bonusLabel } from '@/lib/lottery/games'
import { userActions } from '@/lib/store/user-store'

export default function GeneratePage() {
  const { game } = useApp()
  const [lines, setLines] = useState(3)
  const [result, setResult] = useState<{ gameId: string; combos: Combination[] } | null>(null)
  const [saved, setSaved] = useState<number[]>([])

  function generate() {
    setResult({ gameId: game.id, combos: generateMany(game, 'random', lines) })
    setSaved([])
  }

  return (
    <div className="flex flex-col gap-5 pt-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Generate numbers</h1>
        <p className="mt-1 text-sm text-muted-foreground">Generate valid random combinations. No number selection method can predict a random draw.</p>
      </div>
      <GameSelector />
      <Panel className="flex flex-col gap-4">
        <label htmlFor="lines" className="text-sm font-semibold">How many lines?</label>
        <select id="lines" value={lines} onChange={(event) => setLines(Number(event.target.value))}
          className="min-h-12 w-full rounded-xl border border-white/20 bg-background px-3">
          {[1, 2, 3, 5, 10].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'line' : 'lines'}</option>)}
        </select>
        <button type="button" onClick={generate} className="min-h-12 rounded-xl bg-primary px-5 font-bold text-primary-foreground">
          Generate random numbers
        </button>
      </Panel>
      {result && result.gameId === game.id && (
        <div className="flex flex-col gap-3" aria-live="polite">
          {result.combos.map((combo, i) => (
            <Panel key={i} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Line {i + 1}</h2>
                <button type="button" disabled={saved.includes(i)}
                  onClick={() => {
                    userActions.saveCombination({
                      gameId: game.id, main: combo.main, bonus: combo.bonus,
                      label: `${game.name} · Line ${i + 1}`,
                    })
                    setSaved((previous) => [...previous, i])
                  }}
                  className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-primary disabled:opacity-60">
                  {saved.includes(i) ? 'Saved ✓' : 'Save line'}
                </button>
              </div>
              <BallRow main={combo.main} bonus={combo.bonus} bonusLabel={bonusLabel(game)} size="sm" />
            </Panel>
          ))}
        </div>
      )}
      <RandomnessNote />
    </div>
  )
}
