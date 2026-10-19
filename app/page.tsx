import { AllResults } from '@/components/home/all-results'

export default function HomePage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">South African Lottery</p>
        <h1 className="mt-1 font-heading text-2xl font-bold">Latest draw results</h1>
        <p className="mt-1 text-sm text-muted-foreground">All six games, updated when results are available.</p>
      </div>
      <AllResults />
      <p className="px-2 pb-3 text-center text-xs leading-relaxed text-muted-foreground">
        Draw data by <a href="https://bettip.co.za/" target="_blank" rel="noopener noreferrer" className="underline">BetTip</a>, an independent publisher. Check official results and winnings at <a href="https://www.nationallottery.co.za/" target="_blank" rel="noopener noreferrer" className="underline">National Lottery</a>. LottoLab is independent. 18+.
      </p>
    </div>
  )
}
