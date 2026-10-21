package za.co.lottolab.core

import kotlin.math.sqrt
import kotlin.math.max
import kotlin.math.min

/** Neutral historical benchmarks for independent lottery draws; never a forecast. */
data class AppearanceBenchmark(val expected:Double,val stdDev:Double,val lowerApprox:Double,val upperApprox:Double)
object StatsBenchmark {
 fun appearance(draws:Int,ballCount:Int,ballMaximum:Int):AppearanceBenchmark {
  require(draws>=0 && ballCount in 1..ballMaximum && ballMaximum>1)
  val p=ballCount.toDouble()/ballMaximum
  val expected=draws*p
  val stdDev=sqrt(draws*p*(1.0-p))
  return AppearanceBenchmark(
   expected,stdDev,
   max(0.0,expected-1.96*stdDev),
   min(draws.toDouble(),expected+1.96*stdDev)
  )
 }
}
