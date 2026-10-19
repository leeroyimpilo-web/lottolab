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
 @Test fun monetaryPrecision(){val payout="""{"data":[{"game":"powerball-plus","date":"2026-06-02","divisions":[{"matched":"0 + PowerBall","prize":10.10,"winners":5}]}]}""";assertEquals(1010L,FeedParser.parse(raw,payout,now).draws.single().prizes.single().cents)}
}
