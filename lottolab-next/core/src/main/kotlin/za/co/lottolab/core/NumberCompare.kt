package za.co.lottolab.core

import java.time.LocalDate

/** Descriptive main-ball statistics. They make no prediction about a future draw. */
data class NumberObservation(
 val number:Int,
 val hits:Int,
 val expectedHits:Double,
 val observedPercent:Double,
 val lastSeen:String?
)
data class NumberComparison(
 val game:String,
 val ruleId:String?,
 val sampleSize:Int,
 val first:NumberObservation,
 val second:NumberObservation,
 val jointHits:Int,
 val expectedJointHits:Double,
 val jointDates:List<String>,
 val eitherNumberDrawRate:Double
)
object NumberCompare {
 fun analyse(draws:List<Draw>,game:String,a:Int,b:Int):NumberComparison {
  require(a!=b){"Choose two different main numbers"}
  val rows=draws.filter{it.game==game}
  require(rows.map{it.ruleId}.distinct().size<=1){"Choose one game and rule period"}
  val rule=rows.firstOrNull()?.let{Rules.forDraw(it.game,LocalDate.parse(it.date))}
   ?:Rules.forDraw(game,Rules.cutover)
  requireNotNull(rule){"Unsupported game or rule period"}
  require(a in 1..rule.max && b in 1..rule.max){"Choose numbers from 1 to ${rule.max}"}
  val p=rule.count.toDouble()/rule.max
  val pairP=rule.count.toDouble()*(rule.count-1)/(rule.max.toDouble()*(rule.max-1))
  val mostRecent=rows.sortedByDescending{it.date}
  fun observation(n:Int):NumberObservation {
   val matched=mostRecent.filter{n in it.numbers}
   return NumberObservation(n,matched.size,rows.size*p,
    if(rows.isEmpty())0.0 else 100.0*matched.size/rows.size,
    matched.firstOrNull()?.date)
  }
  val together=mostRecent.filter{a in it.numbers && b in it.numbers}
  val unionCount=mostRecent.count{a in it.numbers || b in it.numbers}
  return NumberComparison(game,rows.firstOrNull()?.ruleId,rows.size,
   observation(a),observation(b),together.size,rows.size*pairP,
   together.map{it.date},if(rows.isEmpty())0.0 else unionCount.toDouble()/rows.size)
 }
}
