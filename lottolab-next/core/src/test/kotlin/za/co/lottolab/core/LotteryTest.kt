package za.co.lottolab.core
import org.junit.Test
import org.junit.Assert.*
import java.time.LocalDate
class LotteryTest {
 @Test fun currentOdds(){assertEquals(20358520L,jackpotOutcomes(Games.get("lotto")));assertEquals(33900160L,jackpotOutcomes(Games.get("powerball")));assertEquals(376992L,jackpotOutcomes(Games.get("daily-lotto")))}
 @Test fun cutover(){assertEquals(58,Rules.forDraw("lotto",LocalDate.parse("2026-05-30"))!!.max);assertEquals(52,Rules.forDraw("lotto",LocalDate.parse("2026-06-03"))!!.max);assertEquals(20,Rules.forDraw("powerball",LocalDate.parse("2026-05-29"))!!.specialMax);assertEquals(16,Rules.forDraw("powerball",LocalDate.parse("2026-06-02"))!!.specialMax)}
 @Test fun renamedGames(){assertEquals("powerball-plus",Games.canonical("powerball-plus",LocalDate.parse("2026-05-29")));assertEquals("powerball-xtra",Games.canonical("powerball-plus",LocalDate.parse("2026-06-02")));assertNull(Rules.forDraw("daily-lotto-plus",LocalDate.parse("2026-06-02")))}
 @Test(expected=IllegalArgumentException::class) fun rejectOldNumber(){Rules.validate("lotto",LocalDate.parse("2026-06-03"),listOf(1,2,3,4,5,58),9)}
 @Test(expected=IllegalArgumentException::class) fun bonusNotMain(){Rules.validate("lotto",LocalDate.parse("2026-06-03"),listOf(1,2,3,4,5,6),6)}
 @Test fun missingPayoutIsPending(){val d=Draw("x","lotto","2026-06-03",listOf(1,2,3,4,5,6),7,"lotto-2026");val c=Checker.check(Line(listOf(1,2,3,20,21,22)),d);assertNull(c.cents);assertTrue(c.status.contains("pending"))}
 @Test fun bonusTier(){val d=Draw("x","lotto","2026-06-03",listOf(1,2,3,4,5,6),7,"lotto-2026",listOf(Prize(2,true,3000)));val c=Checker.check(Line(listOf(1,2,7,20,21,22)),d);assertEquals(3000L,c.cents);assertTrue(c.special)}
 @Test fun powerballOnly(){val d=Draw("x","powerball","2026-06-02",listOf(1,2,3,4,5),6,"powerball-2026",listOf(Prize(0,true,1000)));assertEquals(1000L,Checker.check(Line(listOf(10,11,12,13,14),6),d).cents)}
 @Test fun pendingResult(){assertNull(Checker.check(Line(listOf(1,2,3,4,5)),null).cents)}
 @Test fun generators(){Games.all.forEach{g->val ls=Generator.generate(g,100,Filters(locked=setOf(1),excluded=setOf(2)));assertEquals(100,ls.distinct().size);ls.forEach{l->assertEquals(g.count,l.numbers.size);assertTrue(1 in l.numbers);assertFalse(2 in l.numbers);assertTrue(l.numbers.all{it in 1..g.max});if(g.specialMax>0)assertTrue(l.special in 1..g.specialMax)}}}
 @Test fun fullWheel(){val lines=Generator.wheel(Games.get("lotto"),(1..8).toList());assertEquals(28,lines.size);assertEquals(28,lines.distinct().size);assertTrue(Line(listOf(1,2,3,4,5,8)) in lines)}
 @Test fun subsetFrequencyAndGaps(){val ds=(1..4).map{i->Draw("$i","daily-lotto","2026-06-0$i",if(i%2==0)listOf(1,2,3,4,5)else listOf(6,7,8,9,10),null,"daily-2026")};val s=Stats.numbers(ds,36).first();assertEquals(2,s.hits);assertEquals(0,s.gap);assertEquals(50.0,s.rate,0.001);assertEquals(1.0,s.averageGap!!,0.001)}
 @Test(expected=IllegalArgumentException::class) fun noMixedEras(){Stats.numbers(listOf(Draw("1","lotto","2026-06-03",listOf(1,2,3,4,5,6),7,"lotto-2026"),Draw("2","lotto","2026-05-30",listOf(1,2,3,4,5,6),7,"lotto-2025")),52)}
 @Test fun parser(){assertEquals(Line(listOf(1,2,3,4,5),6),parseLines("1,2,3,4,5 + 6",Games.get("powerball")).single())}
 @Test(expected=IllegalArgumentException::class) fun duplicateInput(){parseLines("1 1 3 4 5 6",Games.get("lotto"))}
 @Test(expected=IllegalArgumentException::class) fun impossiblePool(){Generator.generate(Games.get("lotto"),2,Filters(locked=(1..6).toSet()))}
}
