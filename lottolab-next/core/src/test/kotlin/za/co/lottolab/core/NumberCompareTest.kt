package za.co.lottolab.core

import org.junit.Assert.*
import org.junit.Test

class NumberCompareTest {
 private fun draw(date:String,ns:List<Int>,rule:String="lotto-2026") =
  Draw("lotto:$date","lotto",date,ns,7,rule)
 private val sample=listOf(
  draw("2026-10-17",listOf(1,2,3,4,5,6)),
  draw("2026-10-14",listOf(1,3,4,5,6,7)),
  draw("2026-10-10",listOf(2,3,4,5,6,7)),
  draw("2026-10-07",listOf(8,9,10,11,12,13))
 )
 @Test fun countsEachNumberAndPair() {
  val c=NumberCompare.analyse(sample,"lotto",1,2)
  assertEquals(4,c.sampleSize)
  assertEquals(2,c.first.hits)
  assertEquals(2,c.second.hits)
  assertEquals(1,c.jointHits)
  assertEquals(listOf("2026-10-17"),c.jointDates)
  assertEquals("2026-10-17",c.first.lastSeen)
  assertEquals(4.0*6/52,c.first.expectedHits,0.00001)
  assertEquals(4.0*6*5/(52.0*51),c.expectedJointHits,0.00001)
  assertEquals(0.75,c.averageMainOverlap,0.00001)
 }
 @Test fun emptyArchiveShowsNoHistoryWithoutClaimingCompleteness() {
  val c=NumberCompare.analyse(emptyList(),"daily-lotto",1,2)
  assertEquals(0,c.sampleSize)
  assertNull(c.ruleId)
  assertEquals(0,c.jointHits)
  assertTrue(c.jointDates.isEmpty())
 }
 @Test(expected=IllegalArgumentException::class)
 fun rejectsIdenticalNumbers(){NumberCompare.analyse(sample,"lotto",1,1)}
 @Test(expected=IllegalArgumentException::class)
 fun rejectsMixedRulePeriods(){
  NumberCompare.analyse(sample+draw("2026-05-30",listOf(1,2,3,4,5,6),"lotto-2025"),"lotto",1,2)
 }
 @Test(expected=IllegalArgumentException::class)
 fun rejectsNumberOutsidePeriodRange(){NumberCompare.analyse(sample,"lotto",1,58)}
}
