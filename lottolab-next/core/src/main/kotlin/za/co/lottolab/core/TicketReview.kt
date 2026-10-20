package za.co.lottolab.core

import java.time.LocalDate

enum class TicketState {
 AWAITING_DRAW, RESULT_NOT_LOADED, PAYOUT_UNCONFIRMED, PUBLISHED_PAYOUT, NO_PRIZE
}
data class TicketAssessment(val state:TicketState, val check:Check?, val description:String)

object TicketReview {
 /** A provider match is never proof that a physical ticket is genuine or payable. */
 fun assess(gameId:String,date:LocalDate,line:Line,draw:Draw?,today:LocalDate):TicketAssessment {
  require(Rules.forDraw(gameId,date)!=null){"Unsupported game or draw date"}
  if(draw==null) return if(date>today)
   TicketAssessment(TicketState.AWAITING_DRAW,null,"Awaiting draw")
   else TicketAssessment(TicketState.RESULT_NOT_LOADED,null,"Draw result not yet available locally")
  require(draw.game==gameId && draw.date==date.toString()){"Wrong game or draw date"}
  val check=Checker.check(line,draw)
  return when {
   check.cents!=null && check.cents>0L -> TicketAssessment(TicketState.PUBLISHED_PAYOUT,check,"Possible prize • published provider payout")
   check.cents==0L -> TicketAssessment(TicketState.NO_PRIZE,check,"No prize indicated by the available result")
   else -> TicketAssessment(TicketState.PAYOUT_UNCONFIRMED,check,"Numbers checked • prize details not confirmed")
  }
 }
}
