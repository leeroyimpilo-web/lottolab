package za.co.lottolab.core

import org.junit.Assert.*
import org.junit.Test

class StatsBenchmarkTest {
 @Test fun lottoExpectedAppearances() {
  val result=StatsBenchmark.appearance(100,6,52)
  assertEquals(100.0*6/52,result.expected,0.00001)
  assertTrue(result.lowerApprox<result.expected)
  assertTrue(result.upperApprox>result.expected)
  assertTrue(result.upperApprox<=100)
 }
 @Test fun emptyArchiveIsZeroNotPredictive() {
  val r=StatsBenchmark.appearance(0,5,36)
  assertEquals(0.0,r.expected,0.0)
  assertEquals(0.0,r.lowerApprox,0.0)
 }
 @Test(expected=IllegalArgumentException::class)
 fun rejectUnrealisticRule(){StatsBenchmark.appearance(40,53,52)}
}
