'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/components/app/app-providers'
import { GameSelector } from '@/components/lotto/game-selector'
import { BallRow } from '@/components/lotto/lotto-ball'
import { Panel, ProvenanceBadge } from '@/components/lotto/shared'
import { useDraws } from '@/lib/data/repository'
import { formatDayDate } from '@/lib/format'
import { bonusLabel } from '@/lib/lottery/games'
import { matchDivision } from '@/lib/lottery/odds'
import { userActions } from '@/lib/store/user-store'

export default function CheckPage() {
  const { game } = useApp()
  const { draws, isLoading } = useDraws(game.id)
  const [numbers, setNumbers] = useState('')
  const [bonusText, setBonusText] = useState('')
  const [drawId, setDrawId] = useState('')
  const [message, setMessage] = useState('')
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    setNumbers('')
    setBonusText('')
    setDrawId('')
    setMessage('')
    setSaved(false)
  }, [game.id])

  const draw = draws.find((row) => row.id === drawId) || draws[0]
  const parsed = useMemo(() => numbers.split(/[\s,;]+/).filter(Boolean).map(Number), [numbers])
  const validMain = parsed.length === game.mainCount &&
    parsed.every((n) => Number.isInteger(n) && n >= 1 && n <= game.mainMax) &&
    new Set(parsed).size === parsed.length
  const bonus = Number(bonusText)
  const validBonus = game.bonusKind !== 'powerball' || (bonusText.trim().length > 0 && Number.isInteger(bonus) && bonus >= 1 && bonus <= game.bonusMax)
  const matches = draw && validMain ? draw.main.filter((n) => parsed.includes(n)) : []
  const bonusMatched = Boolean(draw && game.bonusKind === 'powerball' && validBonus && bonus === draw.bonus)
  const lottoBonusMatched = Boolean(draw && game.bonusKind === 'bonus' && draw.bonus !== null && parsed.includes(draw.bonus))
  const division = draw && validMain && validBonus
    ? matchDivision(game, matches.length, bonusMatched || lottoBonusMatched)
    : null

  function saveCheck() {
    if (!draw || !validMain || !validBonus || saved) return
    userActions.addTicket({
      gameId: game.id, main: [...parsed].sort((a, b) => a - b),
      bonus: game.bonusKind === 'powerball' ? bonus : null,
      drawId: draw.id, drawDate: draw.date,
      mainMatches: matches.length, bonusMatched: bonusMatched || lottoBonusMatched,
      division: division?.division ?? null, prize: null,
    })
    setSaved(true)
    setMessage('Ticket check saved. Payout amount still requires an official prize table.')
  }

  return <div className="flex flex-col gap-5 pt-8">
    <div>
      <h1 className="font-heading text-2xl font-bold">Check my numbers</h1>
      <p className="mt-1 text-sm text-muted-foreground">Compare your ticket to a downloaded draw. Estimated division only; never a claim confirmation.</p>
    </div>
    <GameSelector />
    <Panel className="flex flex-col gap-4">
      <label htmlFor="draw" className="text-sm font-semibold">Select draw</label>
      {draw ? <select id="draw" value={draw.id} onChange={(e) => { setDrawId(e.target.value); setSaved(false) }} className="min-h-12 rounded-xl bg-background px-3 ring-1 ring-white/20">
        {draws.slice(0, 100).map((row) => <option value={row.id} key={row.id}>{formatDayDate(row.date)}</option>)}
      </select> : <p className="text-sm text-muted-foreground">{isLoading ? 'Loading…' : 'No saved draws. Update first.'}</p>}
      <label htmlFor="numbers" className="text-sm font-semibold">Your {game.mainCount} numbers</label>
      <input id="numbers" inputMode="numeric" placeholder={game.mainCount === 6 ? '4, 8, 15, 23, 42, 51' : '4, 8, 15, 23, 42'}
        value={numbers} onChange={(e) => { setNumbers(e.target.value); setSaved(false) }} className="min-h-12 rounded-xl bg-background px-3 ring-1 ring-white/20" />
      {game.bonusKind === 'powerball' && <>
        <label htmlFor="bonus" className="text-sm font-semibold">Your PowerBall (1–{game.bonusMax})</label>
        <input id="bonus" inputMode="numeric" type="number" min={1} max={game.bonusMax} value={bonusText}
          onChange={(e) => { setBonusText(e.target.value); setSaved(false) }} className="min-h-12 rounded-xl bg-background px-3 ring-1 ring-white/20" />
      </>}
      {!validMain && numbers.length > 0 && <p role="alert" className="text-xs text-bonus">Enter {game.mainCount} different whole numbers between 1 and {game.mainMax}.</p>}
      {draw && validMain && validBonus && <>
        <div className="border-t border-white/10 pt-4">
          <p className="mb-2 text-sm font-semibold">Published draw</p>
          <BallRow main={draw.main} bonus={draw.bonus} bonusLabel={bonusLabel(game)}
            matches={matches} bonusMatched={bonusMatched || lottoBonusMatched} size="sm" />
        </div>
        <p className="text-lg font-bold">{matches.length} main matches{bonusMatched || lottoBonusMatched ? ' + bonus' : ''}</p>
        <p className="text-sm text-muted-foreground">
          {division ? `Possible prize division ${division.division}` : 'No matching prize division under the listed game rules'}
          {' · '}Actual winnings cannot be confirmed without the official prize breakdown.
        </p>
        <ProvenanceBadge provenance={draw.provenance} />
        <button type="button" disabled={saved} onClick={saveCheck} className="min-h-12 rounded-xl bg-primary px-4 font-bold text-primary-foreground disabled:opacity-50">
          {saved ? 'Saved ✓' : 'Save ticket check'}
        </button>
        {message && <p role="status" className="text-xs text-muted-foreground">{message}</p>}
      </>}
    </Panel>
    {!draw && <Link href="/info/updates" className="text-center text-sm font-semibold text-primary underline">Download results</Link>}
  </div>
}
