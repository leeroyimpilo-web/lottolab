import Link from 'next/link'
import { GAMES } from '@/lib/lottery/games'

const TOPICS = ['guide', 'manual', 'faq', 'about']

export function generateStaticParams() {
  return TOPICS.map((topic) => ({ topic }))
}

const FAQ = [
  ['Can LottoLab predict winning numbers?', 'No. Lottery draws are independent random events. Every valid combination has the same jackpot odds.'],
  ['Does LottoLab work offline?', 'After a successful online download, saved draw results, number generation, and saved ticket records remain on this device. Open pages while connected at least once to cache them for offline use.'],
  ['Will results update automatically?', 'The app checks for updates on launch if the last check is over an hour old and when the device reconnects. Use Update now at any time. It does not run background updates when fully closed.'],
  ['Are the draws official?', 'BetTip republishes South African lottery results. Verification flags come from the provider, not an independent review by LottoLab. Check the National Lottery for official confirmation.'],
  ['Why are some results missing?', 'The current free source does not include Lotto 5 Max. Some results may also arrive after source publication delays. Missing results are never fabricated.'],
  ['Why does history begin in June 2026?', 'The game rules changed on 1 June 2026. LottoLab isolates the new-rules era instead of mixing statistics from incompatible formats.'],
  ['What does a possible prize division mean?', 'It compares your ticket against published numbers and game rules. It does not confirm prize amounts or eligibility for a claim.'],
  ['Will I lose saved numbers if I uninstall?', 'Yes, uninstalling or clearing site/app storage may delete records. Cloud backups and export are not implemented yet.'],
]

export default async function InformationPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params
  const title = topic === 'guide' ? 'Lottery game guide' : topic === 'manual' ? 'User manual'
    : topic === 'faq' ? 'Frequently asked questions' : 'About LottoLab'

  return <div className="flex flex-col gap-5 pt-8">
    <h1 className="font-heading text-2xl font-bold">{title}</h1>

    {topic === 'guide' && <>
      <p className="text-sm text-muted-foreground">Current South African lottery games under the June 2026 rules. Add-on games require the base game.</p>
      {GAMES.map((game) => <section key={game.id} className="glass rounded-2xl p-4">
        <h2 className="font-semibold">{game.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{game.tagline}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {game.mainCount} numbers, range 1–{game.mainMax}
          {game.bonusKind === 'powerball' ? ` + PowerBall 1–${game.bonusMax}` : ''}
          {' · '}R{game.boardPrice.toFixed(2)} per board
        </p>
      </section>)}
      <p className="text-xs text-muted-foreground">Rules and prices can change. See the National Lottery before purchasing a ticket.</p>
    </>}

    {topic === 'manual' && <div className="flex flex-col gap-3">
      {[
        ['1. Home', 'Choose a lottery game, check the newest published result and see an overview of historical patterns.'],
        ['2. Results', 'Browse downloaded draw numbers. The date and source verification badge show what the data represents.'],
        ['3. Generate', 'Choose the number of lines and generate valid combinations. Save any combination to My Lotto.'],
        ['4. Check', 'Enter your ticket numbers and select a stored draw. LottoLab counts matching balls and shows a possible division, not a guaranteed cash prize.'],
        ['5. Laboratory', 'Explore number frequency, hot and cold, historical matches, patterns, and exact game odds. None of these tools predicts future results.'],
        ['6. My Lotto', 'Review saved numbers and checked tickets, and record your spending. Records are saved locally on your device.'],
        ['7. Data Updates', 'When connected, tap Update now to download fresh results. The app also checks on startup and when connectivity returns.'],
      ].map(([heading, detail]) => <section key={heading} className="glass rounded-2xl p-4">
        <h2 className="font-semibold">{heading}</h2><p className="mt-2 text-sm text-muted-foreground">{detail}</p>
      </section>)}
      <Link className="text-sm font-semibold text-primary underline" href="/info/updates">Open Data Updates</Link>
    </div>}

    {topic === 'faq' && <div className="flex flex-col gap-3">
      {FAQ.map(([question, answer]) => <section key={question} className="glass rounded-2xl p-4">
        <h2 className="font-semibold">{question}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{answer}</p>
      </section>)}
    </div>}

    {topic === 'about' && <section className="glass rounded-2xl p-4">
      <h2 className="font-semibold">South African lottery research</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        LottoLab is an independent tool for exploring historical draw results, generating valid number combinations,
        checking tickets and managing lottery spending. It is not affiliated with the South African National Lottery.
        It does not sell tickets, guarantee prizes or make future-draw predictions.
      </p>
      <p className="mt-3 text-sm text-muted-foreground">Published data is credited to
        {' '}<a href="https://bettip.co.za/" className="text-primary underline" target="_blank" rel="noopener noreferrer">BetTip</a>.
        Always confirm results, game procedures and prize claims with the
        {' '}<a href="https://www.nationallottery.co.za/" className="text-primary underline" target="_blank" rel="noopener noreferrer">National Lottery</a>.
      </p>
      <p className="mt-3 text-xs text-muted-foreground">18+ only. Play responsibly. Gambling support: National Responsible Gambling Programme, 0800 006 008.</p>
    </section>}
  </div>
}
