package za.co.lottolab.core

import java.util.Locale

/**
 * Export historical observations without treating a feed as certified results.
 * UTF-8 CSV, with spreadsheet formula injection mitigation for untrusted text.
 */
object ResearchCsv {
 private fun cell(value:Any?):String {
  val str=value?.toString()?:""
  val safe=if(str.trimStart().firstOrNull() in listOf('=','+','-','@','\t','\r')) "'" + str else str
  return "\"" + safe.replace("\"","\"\"") + "\""
 }
 private fun row(vararg values:Any?)=values.joinToString(","){cell(it)}+"\r\n"
 private fun numeric(x:Double)=String.format(Locale.US,"%.4f",x)
 private fun intro(title:String,game:String,rule:String?,sample:Int)=
  row("LottoLab Next",title)+row("Game",game)+row("Rule period",rule?:"No stored draws")+
   row("Available draw records",sample)+row("Important","Historical provider data may be incomplete; not a prediction or official validation")+row()
 fun comparison(c:NumberComparison):String=buildString{
  append(intro("Number comparison",c.game,c.ruleId,c.sampleSize))
  append(row("Metric","Number ${c.first.number}","Number ${c.second.number}"))
  append(row("Observed appearances",c.first.hits,c.second.hits))
  append(row("Expected average appearances",numeric(c.first.expectedHits),numeric(c.second.expectedHits)))
  append(row("Observed appearance rate percent",numeric(c.first.observedPercent),numeric(c.second.observedPercent)))
  append(row("Last observed draw",c.first.lastSeen?:"Not observed",c.second.lastSeen?:"Not observed"))
  append(row())
  append(row("Pair observed together",c.jointHits))
  append(row("Pair expected average",numeric(c.expectedJointHits)))
  append(row("Either-number draw rate",numeric(c.eitherNumberDrawRate)))
  append(row())
  append(row("Historical draw dates containing both"))
  c.jointDates.forEach{append(row(it))}
 }
 fun combination(c:CombinationReport):String=buildString{
  append(intro("Historical combination explorer",c.game,c.ruleId,c.sampleSize))
  append(row("Selected main numbers",c.chosen.joinToString(" ")))
  append(row("Complete subset occurrences",c.fullOccurrences))
  append(row("Best historical match",c.bestMatch))
  append(row())
  append(row("Matches","Draw count"))
  c.histogram.forEachIndexed{i,n->append(row(i,n))}
  append(row())
  append(row("Date","Match count","Matched main numbers","Draw main numbers","Provider"))
  c.matchingDraws.forEach{h->append(row(h.draw.date,h.count,h.matched.joinToString(" "),h.draw.numbers.joinToString(" "),h.draw.source))}
 }
 fun portfolio(c:PortfolioReport):String=buildString{
  append(row("LottoLab Next","Ticket portfolio report"))
  append(row("Important","Record of saved entries, not proof of ticket purchase, winnings or prize eligibility"))
  append(row("Saved entries",c.totalLines))
  append(row("Distinct entries by game and draw",c.uniqueEntries))
  append(row("Repeated entries",c.duplicateEntries))
  append(row("Recorded cost in cents",c.costCents))
  append(row())
  append(row("Game","Draw date","Entries","Unique entries","Additional identical entries","Recorded cost cents","Maximum main overlap"))
  c.groups.forEach{g->append(row(g.game,g.date,g.lines,g.uniqueLines,g.duplicateEntries,g.costCents,g.maxMainOverlap?:"Not calculated"))}
  append(row())
  append(row("Identical entry groups","Game","Draw date","Numbers","Quantity"))
  c.duplicates.forEach{d->append(row("Repeated",d.game,d.date,d.line.display(),d.quantity))}
 }
}
