import { Activity } from '@/components/home/activity'
import { FeaturedResult } from '@/components/home/featured-result'
import { HomeHeader } from '@/components/home/home-header'
import { QuickActions } from '@/components/home/quick-actions'
import { StatsOverview } from '@/components/home/stats-overview'
import { GameSelector } from '@/components/lotto/game-selector'

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <HomeHeader />
      <div className="flex flex-col gap-3">
        <GameSelector />
        <FeaturedResult />
      </div>
      <QuickActions />
      <StatsOverview />
      <Activity />
      <p className="pb-3 text-center text-xs leading-relaxed text-muted-foreground">Published draw data by <a href="https://bettip.co.za/" target="_blank" rel="noopener noreferrer" className="underline">BetTip</a>. LottoLab is independent and is not affiliated with the National Lottery.</p>
    </div>
  )
}
