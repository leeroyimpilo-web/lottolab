package za.co.lottolab.core

import org.junit.Assert.*
import org.junit.Test
import java.time.LocalDate

class CoverageAuditTest {
 private fun lotto(date:String)=Draw("lotto:$date","lotto",date,listOf(1,2,3,4,5,6),7,"lotto-2026")
 @Test fun countsMissingScheduledDatesFromFirstSeen() {
  val c=CoverageAudit.inspect("lotto",
   listOf(lotto("2026-10-14"),lotto("2026-10-21")),
   LocalDate.parse("2026-10-23"))
  assertEquals(3,c.expectedDraws) // Wed 14 Sat 17 Wed 21
  assertEquals(2,c.storedDraws)
  assertEquals(listOf(LocalDate.parse("2026-10-17")),c.missingDates)
 }
 @Test fun missingEntireGameIsUnknownNotZeroPercent() {
  val c=CoverageAudit.inspect("lotto-5-max",emptyList(),LocalDate.parse("2026-10-23"))
  assertNull(c.since)
  assertEquals(0,c.expectedDraws)
 }
 @Test fun ignoresFutureAndSameDayUnpublishedDraws() {
  val c=CoverageAudit.inspect("daily-lotto",
    listOf(Draw("d","daily-lotto","2026-10-20",listOf(1,2,3,4,5),null,"daily-2026")),
    LocalDate.parse("2026-10-21"))
  assertEquals(1,c.expectedDraws)
  assertTrue(c.missingDates.isEmpty())
 }
}
