package za.co.lottolab.core

import java.time.LocalDate

/** Completeness measured only in a declared local date window, never for the full historic archive. */
data class CoverageWindow(
 val game:String,val since:LocalDate?,val through:LocalDate,
 val expectedDraws:Int,val storedDraws:Int,val missingDates:List<LocalDate>
)
object CoverageAudit {
 fun inspect(gameId:String,draws:List<Draw>,today:LocalDate):CoverageWindow {
  val lastEligible=today.minusDays(1) // a draw on today's calendar date can still be pending
  val saved=draws.filter{it.game==gameId && it.date>=Rules.cutover.toString() && it.date<=lastEligible.toString()}
  val earliest:LocalDate = saved.minByOrNull{it.date}?.let{LocalDate.parse(it.date)}
   ?: return CoverageWindow(gameId,null,lastEligible,0,0,emptyList())
  val stored=saved.map{it.date}.toSet()
  val missing=mutableListOf<LocalDate>()
  var expected=0
  var day:LocalDate=earliest
  while(day<=lastEligible) {
   if(DrawSchedule.isScheduled(gameId,day)){
    expected++
    if(day.toString() !in stored)missing+=day
   }
   day=day.plusDays(1)
  }
  return CoverageWindow(gameId,earliest,lastEligible,expected,expected-missing.size,missing)
 }
}
