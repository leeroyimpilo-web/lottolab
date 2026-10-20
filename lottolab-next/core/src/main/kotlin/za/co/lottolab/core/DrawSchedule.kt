package za.co.lottolab.core

import java.time.DayOfWeek
import java.time.LocalDate

/** Schedule consecutive eligible draws from a date chosen by the user. */
object DrawSchedule {
 fun isScheduled(gameId:String, date:LocalDate):Boolean {
  if(Rules.forDraw(gameId,date)==null || date<Rules.cutover) return false
  return when(Games.family(gameId)) {
   "lotto","lotto-plus-1","lotto-5-max" -> date.dayOfWeek==DayOfWeek.WEDNESDAY || date.dayOfWeek==DayOfWeek.SATURDAY
   "powerball","powerball-xtra" -> date.dayOfWeek==DayOfWeek.TUESDAY || date.dayOfWeek==DayOfWeek.FRIDAY
   "daily-lotto" -> true
   else -> false
  }
 }
 fun nextDates(gameId:String,firstOnOrAfter:LocalDate,count:Int):List<LocalDate> {
  require(count in 1..10){"Choose between 1 and 10 consecutive draws"}
  require(firstOnOrAfter>=Rules.cutover){"Choose a date from the current rule period"}
  require(Games.all.any{it.id==gameId}){"Unknown game"}
  val out=mutableListOf<LocalDate>()
  var date=firstOnOrAfter
  while(out.size<count) {
   if(isScheduled(gameId,date))out+=date
   date=date.plusDays(1)
  }
  return out
 }
}
