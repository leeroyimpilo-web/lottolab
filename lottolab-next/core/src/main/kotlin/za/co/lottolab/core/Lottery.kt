package za.co.lottolab.core

import java.security.SecureRandom
import java.time.LocalDate

data class Game(val id: String, val title: String, val count: Int, val max: Int, val specialMax: Int, val priceCents: Int, val color: Long, val days: String)
object Games {
 val all = listOf(
  Game("lotto", "Lotto", 6,52,0,500,0xFFFFC928,"Wednesday • Saturday"),
  Game("lotto-plus-1", "Lotto Plus 1",6,52,0,250,0xFFDC3748,"Wednesday • Saturday"),
  Game("lotto-5-max", "Lotto 5 Max",6,52,0,250,0xFF27865B,"Wednesday • Saturday"),
  Game("powerball", "PowerBall",5,50,16,1000,0xFFE87523,"Tuesday • Friday"),
  Game("powerball-xtra", "PowerBall XTRA",5,50,16,500,0xFF693BB8,"Tuesday • Friday"),
  Game("daily-lotto", "Daily Lotto",5,36,0,300,0xFF1884BF,"Daily")
 )
 fun get(id: String) = all.first { it.id == id }
 fun canonical(id: String, date: LocalDate): String = when(id.lowercase().replace('_','-')) {
  "powerball-plus", "powerball-xtra" -> if(date >= Rules.cutover) "powerball-xtra" else "powerball-plus"
  "lotto-plus-2", "lotto-5-max" -> if(date >= Rules.cutover) "lotto-5-max" else "lotto-plus-2"
  else -> id.lowercase().replace('_','-')
 }
 fun family(id: String) = when(id) { "powerball-plus" -> "powerball-xtra"; "lotto-plus-2" -> "lotto-5-max"; "daily-lotto-plus" -> "daily-lotto"; else -> id }
}
data class Rule(val id:String,val count:Int,val max:Int,val specialMax:Int,val bonus:Boolean,val current:Boolean)
object Rules {
 val cutover: LocalDate = LocalDate.parse("2026-06-01")
 fun forDraw(game:String,date:LocalDate):Rule? {
  val current=date>=cutover
  if(game=="daily-lotto-plus") return if(!current && date>=LocalDate.parse("2025-09-21")) Rule("daily-plus-2025",5,36,0,false,false) else null
  if(game=="daily-lotto") return if(date>=LocalDate.parse("2019-03-10")) Rule(if(current) "daily-2026" else "daily-legacy",5,36,0,false,current) else null
  if(game in listOf("powerball","powerball-plus","powerball-xtra")) {
   if(date<LocalDate.parse("2015-11-28")) return null
   if(game=="powerball-plus" && current || game=="powerball-xtra" && !current) return null
   return Rule(if(current) "powerball-2026" else "powerball-2015",5,50,if(current)16 else 20,false,current)
  }
  if(game !in listOf("lotto","lotto-plus-1","lotto-plus-2","lotto-5-max")) return null
  if(game=="lotto-plus-2" && current || game=="lotto-5-max" && !current) return null
  if(date<LocalDate.parse("2000-03-11")) return null
  if(game=="lotto-plus-1" && date<LocalDate.parse("2003-11-26")) return null
  if(game=="lotto-plus-2" && date<LocalDate.parse("2017-07-30")) return null
  return when {
   current -> Rule("lotto-2026",6,52,0,true,true)
   date>=LocalDate.parse("2025-09-21") -> Rule("lotto-2025",6,58,0,true,false)
   date>=LocalDate.parse("2017-07-30") -> Rule("lotto-2017",6,52,0,true,false)
   else -> Rule("lotto-original",6,49,0,true,false)
  }
 }
 fun validate(game:String,date:LocalDate,n:List<Int>,special:Int?):Rule {
  val r=requireNotNull(forDraw(game,date)){"Unsupported game or rule period"}
  require(n.size==r.count && n.distinct().size==n.size && n.all{it in 1..r.max}){"Invalid main numbers"}
  if(r.specialMax>0) require(special!=null && special in 1..r.specialMax){"Invalid PowerBall"}
  else if(r.bonus) require(special!=null && special in 1..r.max && special !in n){"Invalid bonus ball"}
  else require(special==null){"Unexpected bonus ball"}
  return r
 }
}
data class Prize(val matches:Int,val special:Boolean,val cents:Long?,val winners:Long?=null,val label:String="")
data class Draw(val id:String,val game:String,val date:String,val numbers:List<Int>,val special:Int?,val ruleId:String,val prizes:List<Prize> = emptyList(),val source:String="BetTip",val retrievedAt:String="",val sourceUrl:String="",val revision:Int=1)
data class Line(val numbers:List<Int>,val special:Int?=null)
data class Check(val matches:Int,val special:Boolean,val status:String,val cents:Long?,val matched:List<Int>)
object Checker {
 fun check(line:Line, draw:Draw?):Check {
  if(draw==null) return Check(0,false,"Results pending",null,emptyList())
  val r=Rules.forDraw(draw.game,LocalDate.parse(draw.date)) ?: error("Unsupported rules")
  require(line.numbers.size==r.count && line.numbers.distinct().size==r.count && line.numbers.all{it in 1..r.max}){"Enter ${r.count} different numbers from 1–${r.max}"}
  if(r.specialMax>0) require(line.special!=null && line.special in 1..r.specialMax){"Enter a PowerBall from 1–${r.specialMax}"}
  val hit=line.numbers.intersect(draw.numbers.toSet()).sorted()
  val s=if(r.specialMax>0) line.special==draw.special else r.bonus && draw.special in line.numbers
  // A winning tier is never inferred across historic rule versions.
  val prize=draw.prizes.firstOrNull{it.matches==hit.size && it.special==s}
   ?: draw.prizes.firstOrNull{it.matches==hit.size && !it.special && !s}
  if(prize!=null) return Check(hit.size,s,if(prize.cents==null) "Numbers available; payout pending" else "Published payout available",prize.cents,hit)
  val possible=when {
   r.specialMax>0 -> s || hit.size>=3
   !r.bonus -> hit.size>=2
   r.id=="lotto-2026" -> hit.size>=3 || hit.size==2 && s
   else -> true // Unknown historical tier rules: do not declare no prize.
  }
  return Check(hit.size,s,if(possible)"Numbers available; payout pending" else "No prize under current rules",if(possible)null else 0,hit)
 }
}
fun choose(n:Int,k:Int):Long {
 if(k<0 || k>n) return 0
 var x=1L
 for(i in 1..minOf(k,n-k)) x=x*(n-i+1)/i
 return x
}
fun jackpotOutcomes(g:Game)=choose(g.max,g.count)*maxOf(1,g.specialMax)
fun parseNumbers(s:String):List<Int> {
 if(s.isBlank()) return emptyList()
 require(s.trim().matches(Regex("[0-9,;\\s]+"))){"Use numbers separated by spaces or commas"}
 return s.trim().split(Regex("[,;\\s]+")).map{it.toInt()}
}
fun parseLines(s:String,g:Game):List<Line> = s.lines().filter{it.isNotBlank()}.map{raw->
 val parts=raw.split('+');require(parts.size<=2){"Use main numbers + PowerBall"}
 val n=parseNumbers(parts[0]); val special=parts.getOrNull(1)?.trim()?.toIntOrNull()
 require(n.size==g.count && n.distinct().size==n.size && n.all{it in 1..g.max}){"Enter ${g.count} different numbers from 1–${g.max}"}
 if(g.specialMax>0) require(special!=null && special in 1..g.specialMax){"Add + PowerBall (1–${g.specialMax})"} else require(parts.size==1){"Do not enter the drawn bonus ball on your ticket"}
 Line(n.sorted(),special)
}.also{require(it.isNotEmpty()){"Enter at least one line"}}
fun Line.display()=numbers.joinToString(" "){it.toString().padStart(2,'0')}+(special?.let{" + ${it.toString().padStart(2,'0')}"}?:"")
data class Filters(val locked:Set<Int> = emptySet(),val excluded:Set<Int> = emptySet(),val odd:Int?=null,val sumMin:Int?=null,val sumMax:Int?=null,val noConsecutive:Boolean=false,val minSpread:Int?=null)
object Generator {
 private val rng=SecureRandom()
 fun generate(g:Game,count:Int,f:Filters=Filters()):List<Line> {
  require(count in 1..100){"Choose 1–100 lines"}
  require(f.locked.all{it in 1..g.max} && f.excluded.all{it in 1..g.max}){"A locked/excluded number is outside this game's range"}
  require(f.locked.size<=g.count && f.locked.intersect(f.excluded).isEmpty()){"Locked numbers conflict"}
  require(f.odd==null || f.odd in 0..g.count){"Invalid odd count"}
  require(f.sumMin==null || f.sumMax==null || f.sumMin<=f.sumMax){"Minimum sum exceeds maximum"}
  val pool=(1..g.max).filter{it !in f.locked && it !in f.excluded}
  require(pool.size>=g.count-f.locked.size){"Too many numbers excluded"}
  require(choose(pool.size,g.count-f.locked.size)*maxOf(1,g.specialMax)>=count){"Not enough unique combinations"}
  val result=linkedSetOf<Line>()
  repeat(100000) {
   val bag=pool.toMutableList()
   for(i in bag.lastIndex downTo 1){val j=rng.nextInt(i+1);val x=bag[i];bag[i]=bag[j];bag[j]=x}
   val n=(f.locked+bag.take(g.count-f.locked.size)).sorted()
   if((f.odd==null || n.count{it%2==1}==f.odd) && (f.sumMin==null || n.sum()>=f.sumMin) && (f.sumMax==null || n.sum()<=f.sumMax) && (!f.noConsecutive || n.zipWithNext().none{it.second-it.first==1}) && (f.minSpread==null || n.last()-n.first()>=f.minSpread)) {
    result+=Line(n,if(g.specialMax>0)rng.nextInt(g.specialMax)+1 else null)
    if(result.size==count) return result.toList()
   }
  }
  error("These filters could not produce enough lines. Relax a filter.")
 }
 fun wheel(g:Game,pool:List<Int>,special:Int?=null):List<Line> {
  require(pool.distinct().size==pool.size && pool.all{it in 1..g.max}){"Use unique, valid numbers"}
  require(pool.size>=g.count && choose(pool.size,g.count)<=2000){"Choose a pool producing at most 2,000 lines"}
  if(g.specialMax>0) require(special!=null && special in 1..g.specialMax){"Choose a valid PowerBall"}
  return combinations(pool.sorted(),g.count).map{Line(it,special)}
 }
}
fun combinations(n:List<Int>,k:Int):List<List<Int>> {
 val out=mutableListOf<List<Int>>()
 fun go(start:Int,acc:List<Int>){if(acc.size==k){out+=acc;return};for(i in start..n.size-(k-acc.size))go(i+1,acc+n[i])}
 if(k in 0..n.size) go(0,emptyList())
 return out
}
data class NumberStat(val number:Int,val hits:Int,val rate:Double,val gap:Int,val lastSeen:String?,val averageGap:Double?,val longestGap:Int)
object Stats {
 fun numbers(draws:List<Draw>,max:Int,special:Boolean=false):List<NumberStat> {
  require(draws.map{it.ruleId}.distinct().size<=1){"Select one rule period"}
  require(draws.map{it.game}.distinct().size<=1){"Select one game"}
  val sorted=draws.sortedByDescending{it.date}
  return (1..max).map{n->
   val indices=sorted.indices.filter{if(special)sorted[it].special==n else n in sorted[it].numbers}
   val gaps=indices.zipWithNext{a,b->b-a-1}
   NumberStat(n,indices.size,if(sorted.isEmpty())0.0 else indices.size*100.0/sorted.size,indices.firstOrNull()?:sorted.size,indices.firstOrNull()?.let{sorted[it].date},if(gaps.isEmpty())null else gaps.average(),(gaps+listOf(indices.firstOrNull()?:sorted.size,indices.lastOrNull()?.let{sorted.size-it-1}?:sorted.size)).maxOrNull()?:0)
  }
 }
 fun groups(draws:List<Draw>,size:Int)=draws.flatMap{combinations(it.numbers.sorted(),size)}.groupingBy{it}.eachCount().entries.sortedByDescending{it.value}
 fun overlaps(lines:List<Line>)=lines.indices.flatMap{a->(a+1 until lines.size).map{b->Triple(a+1,b+1,lines[a].numbers.intersect(lines[b].numbers.toSet()).size)}}
}
