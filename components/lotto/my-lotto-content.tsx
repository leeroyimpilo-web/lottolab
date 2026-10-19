'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/components/app/app-providers'
import { BallRow } from '@/components/lotto/lotto-ball'
import { Panel } from '@/components/lotto/shared'
import { formatDayDate, formatRand } from '@/lib/format'
import { getGame } from '@/lib/lottery/games'
import { userActions, useUserStore } from '@/lib/store/user-store'

const SECTIONS = [
  { slug: 'saved', title: 'Saved numbers', note: 'Your saved combinations' },
  { slug: 'tickets', title: 'Checked tickets', note: 'Your past ticket checks' },
  { slug: 'winnings', title: 'Prize matches', note: 'Matched prize divisions (not cash claims)' },
  { slug: 'spending', title: 'Spending tracker', note: 'Track lottery costs and set your limit' },
] as const

export function MyLottoContent({ section }: { section?: string }) {
  const store = useUserStore()
  const { game } = useApp()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [budget, setBudget] = useState('')
  const total = store.spending.reduce((sum, entry) => sum + entry.amount, 0)
  const title = SECTIONS.find((item) => item.slug === section)?.title ?? 'My Lotto'

  function addSpend() {
    const parsed = Number(amount)
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 1000000) return
    userActions.addSpend({
      gameId: game.id, amount: Math.round(parsed * 100) / 100,
      boards: 1, date: new Date().toISOString(), note: note.trim(),
    })
    setAmount('')
    setNote('')
  }

  return <div className="flex flex-col gap-5 pt-8">
    {section && <Link href="/my-lotto" className="text-sm font-semibold text-primary">← My Lotto</Link>}
    <div>
      <h1 className="font-heading text-2xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Everything you save stays on this device, including when you are offline.</p>
    </div>
    {!section && <div className="grid grid-cols-2 gap-3">
      {SECTIONS.map((item) => <Link href={`/my-lotto/${item.slug}`} key={item.slug} className="glass min-h-28 rounded-2xl p-4">
        <h2 className="font-semibold">{item.title}</h2>
        <p className="mt-2 text-xs text-muted-foreground">{item.note}</p>
      </Link>)}
    </div>}
    {(!section || section === 'saved') && <Panel>
      <div className="flex justify-between"><h2 className="font-semibold">Saved combinations</h2><p className="text-sm text-primary">{store.saved.length}</p></div>
      {store.saved.length === 0 && <p className="mt-2 text-sm text-muted-foreground">Nothing saved yet. <Link href="/generate" className="underline text-primary">Generate numbers</Link> to start.</p>}
      {store.saved.map((item) => <div key={item.id} className="mt-4 border-t border-white/10 pt-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div><p className="text-sm font-semibold">{item.label}</p><p className="text-xs text-muted-foreground">{getGame(item.gameId).name}</p></div>
          <button type="button" onClick={() => userActions.removeCombination(item.id)} className="px-2 py-1 text-xs text-bonus">Remove</button>
        </div>
        <BallRow main={item.main} bonus={item.bonus} size="xs" />
      </div>)}
    </Panel>}
    {(!section || section === 'tickets' || section === 'winnings') && <Panel>
      <div className="flex justify-between"><h2 className="font-semibold">{section === 'winnings' ? 'Potential prize divisions' : 'Checked tickets'}</h2><p className="text-sm text-primary">{store.tickets.length}</p></div>
      <p className="mt-2 text-xs text-muted-foreground">A division match is not proof of a winning claim. Payout values require official verification.</p>
      {store.tickets.filter((item) => section !== 'winnings' || item.division !== null).length === 0 &&
        <p className="mt-3 text-sm text-muted-foreground">No matching records yet. <Link href="/check" className="text-primary underline">Check a ticket</Link>.</p>}
      {store.tickets.filter((item) => section !== 'winnings' || item.division !== null).map((item) =>
        <div key={item.id} className="mt-4 border-t border-white/10 pt-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">{getGame(item.gameId).name} · {formatDayDate(item.drawDate)}</p>
            <button type="button" onClick={() => userActions.removeTicket(item.id)} className="text-xs text-bonus">Remove</button>
          </div>
          <div className="mt-2"><BallRow main={item.main} bonus={item.bonus} size="xs" /></div>
          <p className="mt-2 text-xs text-muted-foreground">
            {item.mainMatches} main matched{item.bonusMatched ? ' + bonus' : ''} · {item.division ? `Possible Division ${item.division}` : 'No division'} · Prize not confirmed
          </p>
        </div>,
      )}
    </Panel>}
    {(!section || section === 'spending') && <>
      <Panel className="flex flex-col gap-3">
        <h2 className="font-semibold">Spending tracker</h2>
        <p className="text-2xl font-bold">{formatRand(total, true)}</p>
        <p className="text-xs text-muted-foreground">Total recorded spending · All dates</p>
        <p className="text-sm">Monthly budget: {formatRand(store.monthlyBudget, true)}</p>
        {section === 'spending' && <>
          <label htmlFor="amount" className="text-sm font-semibold">Amount spent (R)</label>
          <input id="amount" type="number" min="0.01" step="0.01" inputMode="decimal" value={amount}
            onChange={(event) => setAmount(event.target.value)} placeholder="e.g. 30.00"
            className="min-h-12 rounded-xl bg-background px-3 ring-1 ring-white/20" />
          <label htmlFor="note" className="text-sm font-semibold">Note (optional)</label>
          <input id="note" value={note} onChange={(event) => setNote(event.target.value)}
            className="min-h-12 rounded-xl bg-background px-3 ring-1 ring-white/20" />
          <button type="button" onClick={addSpend} disabled={!Number.isFinite(Number(amount)) || Number(amount) <= 0}
            className="min-h-12 rounded-xl bg-primary px-3 font-semibold text-primary-foreground disabled:opacity-50">Add expense</button>
          <label htmlFor="budget" className="text-sm font-semibold">Change monthly budget (R)</label>
          <div className="flex gap-2">
            <input id="budget" type="number" min="0" step="1" inputMode="decimal" value={budget}
              onChange={(e) => setBudget(e.target.value)} placeholder={String(store.monthlyBudget)}
              className="min-w-0 flex-1 rounded-xl bg-background px-3 ring-1 ring-white/20" />
            <button type="button" onClick={() => {
              const value = Number(budget)
              if (budget.trim() && Number.isFinite(value) && value >= 0) { userActions.setBudget(value); setBudget('') }
            }} className="rounded-xl bg-white/10 px-4 text-sm font-semibold">Save</button>
          </div>
        </>}
      </Panel>
      {section === 'spending' && <Panel>
        <h2 className="font-semibold">Your expenses</h2>
        {store.spending.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No expenses recorded yet.</p>}
        {store.spending.map((entry) => <div key={entry.id} className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
          <div><p className="text-sm font-semibold">{formatRand(entry.amount, true)}</p><p className="text-xs text-muted-foreground">{getGame(entry.gameId).name} · {formatDayDate(entry.date)} {entry.note ? `· ${entry.note}` : ''}</p></div>
          <button type="button" onClick={() => userActions.removeSpend(entry.id)} className="text-xs text-bonus">Remove</button>
        </div>)}
      </Panel>}
    </>}
    <p className="pb-5 text-xs text-muted-foreground">LottoLab is for research and personal records. It cannot determine whether a claim has been accepted. Play responsibly, 18+.</p>
  </div>
}
