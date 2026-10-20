package za.co.lottolab.core

import org.junit.Assert.*
import org.junit.Test
import java.time.LocalDate

class TicketReviewTest {
 private val date=LocalDate.parse("2026-10-20")
 private val game="daily-lotto"
 private val draw=Draw("daily-lotto:2026-10-20",game,date.toString(),listOf(1,2,3,4,5),null,"daily-2026")
 private fun assess(numbers:List<Int>,d:Draw?=draw,today:LocalDate=date)=TicketReview.assess(game,date,Line(numbers),d,today)

 @Test fun missingFutureDrawRemainsAwaiting() {
  assertEquals(TicketState.AWAITING_DRAW,assess(listOf(1,2,3,4,5),null,date.minusDays(1)).state)
 }
 @Test fun missingPastResultNeverMeansLosing() {
  assertEquals(TicketState.RESULT_NOT_LOADED,assess(listOf(1,2,3,4,5),null).state)
 }
 @Test fun observedNumberMatchWithNoPayoutRemainsUnconfirmed() {
  assertEquals(TicketState.PAYOUT_UNCONFIRMED,assess(listOf(1,2,6,7,8)).state)
 }
 @Test fun publishedPrizeIsPotentialUntilOfficiallyConfirmed() {
  val paid=draw.copy(prizes=listOf(Prize(2,false,1500,100,"2")))
  assertEquals(TicketState.PUBLISHED_PAYOUT,assess(listOf(1,2,6,7,8),paid).state)
 }
 @Test fun nonwinnerDoesNotGetFalsePrizeAlert() {
  assertEquals(TicketState.NO_PRIZE,assess(listOf(6,7,8,9,10)).state)
 }
 @Test fun wrongDrawIsRejected() {
  try { assess(listOf(1,2,6,7,8),draw.copy(date="2026-10-21"));fail("Wrong date must not be checked") }
  catch(e:IllegalArgumentException) { assertTrue(e.message!!.contains("Wrong")) }
 }
}
