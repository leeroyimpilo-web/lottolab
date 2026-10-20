package za.co.lottolab.core

import org.junit.Assert.*
import org.junit.Test

class ResearchCsvTest {
 @Test fun keepsComparisonExpectationsAndDistinctObservedCounts() {
  val data=NumberCompare.analyse(
   listOf(Draw("x","daily-lotto","2026-10-20",listOf(1,2,3,4,5),null,"daily-2026")),
   "daily-lotto",1,2)
  val csv=ResearchCsv.comparison(data)
  assertTrue(csv.contains("Pair observed together"))
  assertTrue(csv.contains("Pair expected average"))
  assertTrue(csv.contains("2026-10-20"))
  assertTrue(csv.contains("not a prediction"))
  assertTrue(csv.contains("\r\n"))
 }
 @Test fun guardsUntrustedSpreadsheetValues() {
  val c=CombinationReport("lotto","lotto-2026",1,listOf(1,2),1,2,listOf(0,0,1),
   listOf(HistoricalHit(Draw("x","lotto","2026-10-17",listOf(1,2,3,4,5,6),
    7,"lotto-2026",source="=HYPERLINK(\"https://malicious.example\")"),listOf(1,2))))
  val csv=ResearchCsv.combination(c)
  assertTrue(csv.contains("'=HYPERLINK"))
  assertTrue(csv.contains("2026-10-17"))
 }
 @Test fun reportPreservesMultiDrawGrouping() {
  val p=PortfolioResearch.analyse(listOf(
   PortfolioLine("lotto","2026-10-17",Line(listOf(1,2,3,4,5,6)),true,500),
   PortfolioLine("lotto","2026-10-21",Line(listOf(1,2,3,4,5,6)),true,500)))
  val csv=ResearchCsv.portfolio(p)
  assertTrue(csv.contains("2026-10-17"))
  assertTrue(csv.contains("2026-10-21"))
  assertTrue(csv.contains("Distinct entries"))
 }
}
