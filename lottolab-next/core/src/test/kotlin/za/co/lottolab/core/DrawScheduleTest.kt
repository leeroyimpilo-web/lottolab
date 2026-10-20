package za.co.lottolab.core

import org.junit.Assert.*
import org.junit.Test
import java.time.LocalDate

class DrawScheduleTest {
 @Test fun lottoFromTuesdayStartsWednesdayAndSkipsSunday() {
  val dates=DrawSchedule.nextDates("lotto",LocalDate.parse("2026-10-20"),3)
  assertEquals(listOf("2026-10-21","2026-10-24","2026-10-28"),dates.map{it.toString()})
 }
 @Test fun powerballIncludesFirstDrawDate() {
  val dates=DrawSchedule.nextDates("powerball-xtra",LocalDate.parse("2026-10-20"),3)
  assertEquals(listOf("2026-10-20","2026-10-23","2026-10-27"),dates.map{it.toString()})
 }
 @Test fun dailyIsConsecutiveCalendarDays() {
  val dates=DrawSchedule.nextDates("daily-lotto",LocalDate.parse("2026-10-20"),3)
  assertEquals(listOf("2026-10-20","2026-10-21","2026-10-22"),dates.map{it.toString()})
 }
 @Test fun validatesDrawCount() {
  try { DrawSchedule.nextDates("lotto",LocalDate.parse("2026-10-20"),11);fail("must reject 11 draws") }
  catch(e:IllegalArgumentException){ assertTrue(e.message!!.contains("10")) }
 }
 @Test fun excludesRetiredGame() {
  assertFalse(DrawSchedule.isScheduled("daily-lotto-plus",LocalDate.parse("2026-10-20")))
 }
}
