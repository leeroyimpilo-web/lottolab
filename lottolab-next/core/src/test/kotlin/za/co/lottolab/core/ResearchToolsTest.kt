package za.co.lottolab.core

import org.junit.Assert.*
import org.junit.Test

class ResearchToolsTest {
 private fun lotto(date:String,n:List<Int>,period:String="lotto-2026")=
  Draw("lotto:$date","lotto",date,n,7,period)
 @Test fun countsExactAndPartialHistoryWithoutForecasting() {
  val ds=listOf(
   lotto("2026-10-17",listOf(1,2,3,4,5,6)),
   lotto("2026-10-14",listOf(1,2,10,11,12,13)),
   lotto("2026-10-10",listOf(9,10,11,12,13,14))
  )
  val report=CombinationResearch.analyse(ds,listOf(1,2,3),"lotto")
  assertEquals(3,report.sampleSize)
  assertEquals(1,report.fullOccurrences)
  assertEquals(3,report.bestMatch)
  assertEquals(listOf(1,0,1,1),report.histogram)
  assertEquals("2026-10-17",report.matchingDraws.first().draw.date)
  assertEquals(listOf(1,2,3),report.chosen)
 }
 @Test fun noDataIsNotAnObservedZeroOutOfCompleteArchive() {
  val r=CombinationResearch.analyse(emptyList(),listOf(1,2,3),"lotto")
  assertEquals(0,r.sampleSize)
  assertEquals(null,r.ruleId)
  assertTrue(r.matchingDraws.isEmpty())
 }
 @Test(expected=IllegalArgumentException::class)
 fun cannotCombineRuleEras() {
  CombinationResearch.analyse(listOf(lotto("2026-10-17",listOf(1,2,3,4,5,6)),
   lotto("2026-05-30",listOf(1,2,3,4,5,6),"lotto-2025")),listOf(1),"lotto")
 }
 @Test(expected=IllegalArgumentException::class)
 fun rejectsOutOfRangeCombination() {
  CombinationResearch.analyse(emptyList(),listOf(1,53),"lotto")
 }
 @Test fun portfolioDuplicatesAreScopedToGameAndDrawDate() {
  val row=Line(listOf(1,2,3,4,5,6))
  val rows=listOf(
   PortfolioLine("lotto","2026-10-17",row,true,500),
   PortfolioLine("lotto","2026-10-17",row,true,500),
   PortfolioLine("lotto","2026-10-21",row,true,500),
   PortfolioLine("lotto-plus-1","2026-10-17",row,true,250),
   PortfolioLine("lotto","2026-10-17",Line(listOf(1,2,3,10,11,12)),true,500)
  )
  val r=PortfolioResearch.analyse(rows)
  assertEquals(5,r.totalLines)
  assertEquals(4,r.uniqueEntries)
  assertEquals(1,r.duplicateEntries)
  assertEquals(2250,r.costCents)
  assertEquals(1,r.duplicates.size)
  assertEquals(2,r.duplicates.first().quantity)
  assertEquals(3,r.groups.first{it.game=="lotto" && it.date=="2026-10-17"}.lines)
  assertEquals(3,r.groups.first{it.game=="lotto" && it.date=="2026-10-17"}.maxMainOverlap)
 }
 @Test fun specialBallMakesDistinctTicket() {
  val numbers=listOf(1,2,3,4,5)
  val r=PortfolioResearch.analyse(listOf(
   PortfolioLine("powerball","2026-10-20",Line(numbers,1),true,1000),
   PortfolioLine("powerball","2026-10-20",Line(numbers,2),true,1000)
  ))
  assertEquals(0,r.duplicateEntries)
  assertEquals(5,r.groups.single().maxMainOverlap)
 }
}
