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
    </div>
  )
}
