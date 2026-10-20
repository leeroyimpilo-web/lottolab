package za.co.lottolab.core

/**
 * Historical research only: previous results never alter the odds of a fair future draw.
 * Input draws must represent exactly one game's rule era, including its ball range.
 */
data class HistoricalHit(val draw:Draw,val matched:List<Int>) {
 val count:Int get()=matched.size
}
data class CombinationReport(
 val game:String,
 val ruleId:String?,
 val sampleSize:Int,
 val chosen:List<Int>,
 val fullOccurrences:Int,
 val bestMatch:Int,
 val histogram:List<Int>,
 val matchingDraws:List<HistoricalHit>
)
object CombinationResearch {
 fun analyse(draws:List<Draw>,chosen:List<Int>,game:String):CombinationReport {
  val sample=draws.filter{it.game==game}
  require(sample.map{it.ruleId}.distinct().size<=1){"Select only one rule period"}
  val rule=sample.firstOrNull()?.let{
   Rules.forDraw(it.game,java.time.LocalDate.parse(it.date))
  } ?: Rules.forDraw(game,Rules.cutover)
  requireNotNull(rule){"Unsupported game or rule period"}
  require(chosen.size in 1..rule.count && chosen.distinct().size==chosen.size &&
   chosen.all{it in 1..rule.max}){"Choose 1–${rule.count} unique main numbers from 1–${rule.max}"}
  val selected=chosen.toSet()
  val hits=sample.map { draw->
   HistoricalHit(draw,draw.numbers.filter{it in selected}.sorted())
  }
  val ranked=hits.filter{it.count>0}
   .sortedWith(compareByDescending<HistoricalHit>{it.count}.thenByDescending{it.draw.date})
  return CombinationReport(
   game=game, ruleId=sample.firstOrNull()?.ruleId,
   sampleSize=sample.size,chosen=chosen.sorted(),
   fullOccurrences=hits.count{it.count==chosen.size},
   bestMatch=hits.maxOfOrNull{it.count}?:0,
   histogram=(0..chosen.size).map{k->hits.count{it.count==k}},
   matchingDraws=ranked
  )
 }
}

data class PortfolioLine(val game:String,val drawDate:String,val line:Line,val purchased:Boolean,val costCents:Long)
data class DuplicateGroup(val game:String,val date:String,val line:Line,val quantity:Int)
data class PortfolioGroup(
 val game:String,val date:String,val lines:Int,val uniqueLines:Int,
 val duplicateEntries:Int,val costCents:Long,val maxMainOverlap:Int?
)
data class PortfolioReport(
 val totalLines:Int,val uniqueEntries:Int,val duplicateEntries:Int,val costCents:Long,
 val groups:List<PortfolioGroup>,val duplicates:List<DuplicateGroup>
)
object PortfolioResearch {
 private data class EntryKey(val game:String,val date:String,val numbers:List<Int>,val special:Int?)
 fun analyse(entries:List<PortfolioLine>):PortfolioReport {
  val groups=entries.groupBy{it.game to it.drawDate}
  val duplicates=mutableListOf<DuplicateGroup>()
  val details=groups.map { (key, rows)->
   val byLine=rows.groupBy{EntryKey(it.game,it.drawDate,it.line.numbers.sorted(),it.line.special)}
   for((k,duplicateRows) in byLine) if(duplicateRows.size>1) {
    duplicates+=DuplicateGroup(k.game,k.date,Line(k.numbers,k.special),duplicateRows.size)
   }
   val distinct=byLine.keys.toList()
   // Avoid an unbounded quadratic operation on large imported archives.
   val overlap=if(distinct.size>300)null else {
    var max=0
    for(i in distinct.indices)for(j in i+1 until distinct.size) {
     val shared=distinct[i].numbers.toSet().intersect(distinct[j].numbers.toSet()).size
     if(shared>max)max=shared
    }
    max
   }
   PortfolioGroup(key.first,key.second,rows.size,distinct.size,
    rows.size-distinct.size,rows.sumOf{it.costCents},overlap)
  }.sortedWith(compareByDescending<PortfolioGroup>{it.date}.thenBy{it.game})
  return PortfolioReport(
   totalLines=entries.size,
   uniqueEntries=details.sumOf{it.uniqueLines},
   duplicateEntries=details.sumOf{it.duplicateEntries},
   costCents=entries.sumOf{it.costCents},
   groups=details,
   duplicates=duplicates.sortedWith(compareByDescending<DuplicateGroup>{it.quantity}
    .thenByDescending{it.date})
  )
 }
}
