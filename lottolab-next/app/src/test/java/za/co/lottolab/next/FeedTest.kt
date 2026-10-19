package za.co.lottolab.next
import org.junit.Test
import org.junit.Assert.*
import java.time.Instant
class FeedTest {
 private val now=Instant.parse("2026-10-19T22:00:00Z")
 private val raw="""{"data":[{"game":"powerball-plus","date":"2026-06-02","numbers":[1,2,3,4,5],"bonusBall":16}]}"""
 @Test fun canonicalAndNullPayout(){val p=FeedParser.parse(raw,null,now);assertEquals("powerball-xtra",p.draws.single().game);assertTrue(p.draws.single().prizes.isEmpty())}
 @Test fun noWinnersIsNotPayable(){val payout="""{"data":[{"game":"powerball-plus","date":"2026-06-02","divisions":[{"matched":"5 + PowerBall","prize":1000000,"winners":0}]}]}""";assertNull(FeedParser.parse(raw,payout,now).draws.single().prizes.single().cents)}
 @Test fun malformedRangeRejected(){val p=FeedParser.parse(raw.replace("16}","20}"),null,now);assertEquals(1,p.rejected);assertTrue(p.draws.isEmpty())}
 @Test fun futureRejected(){assertEquals(1,FeedParser.parse(raw.replace("2026-06-02","2027-06-02"),null,now).rejected)}
 @Test fun bundledArchiveIsUsable(){
  val raw=java.util.zip.GZIPInputStream(java.io.FileInputStream("src/main/assets/draws.json.gz")).bufferedReader().readText()
  val payouts=java.util.zip.GZIPInputStream(java.io.FileInputStream("src/main/assets/payouts.json.gz")).bufferedReader().readText()
  val parsed=FeedParser.parse(raw,payouts,now)
  assertEquals(7497,parsed.draws.size);assertEquals(94,parsed.rejected)
  assertTrue(parsed.draws.filter{it.date>="2026-06-01" && it.game=="lotto"}.all{it.numbers.all{n->n<=52}})
  assertTrue(parsed.draws.none{it.game=="lotto-5-max"})
  assertEquals(35881730L,parsed.draws.first{it.game=="daily-lotto" && it.date=="2026-10-19"}.prizes.first{it.matches==5}.cents)
 }
 @Test fun conflictingDuplicatesAreExcluded(){
  val duplicate="""{"data":[{"game":"daily-lotto","date":"2026-06-02","numbers":[1,2,3,4,5]},{"game":"daily-lotto","date":"2026-06-02","numbers":[1,2,3,4,6]}]}"""
  assertTrue(FeedParser.parse(duplicate,null,now).draws.isEmpty())
 }
 @Test fun monetaryPrecision(){val payout="""{"data":[{"game":"powerball-plus","date":"2026-06-02","divisions":[{"matched":"0 + PowerBall","prize":10.10,"winners":5}]}]}""";assertEquals(1010L,FeedParser.parse(raw,payout,now).draws.single().prizes.single().cents)}
}
