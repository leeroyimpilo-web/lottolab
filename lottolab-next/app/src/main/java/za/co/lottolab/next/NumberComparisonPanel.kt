package za.co.lottolab.next

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.platform.LocalContext
import za.co.lottolab.core.*
import java.time.LocalDate
import java.util.Locale

@Composable
fun NumberComparisonPanel(game:Game,draws:List<Draw>) {
 val context=LocalContext.current
 val eras=remember(draws,game.id){
  draws.filter{Games.family(it.game)==game.id}
   .groupBy{it.game+"|"+it.ruleId}.toList()
   .sortedByDescending{(_,rows)->rows.maxOf{it.date}}
 }
 var era by rememberSaveable(game.id){mutableStateOf("")}
 val active=eras.firstOrNull{it.first==era}?:eras.firstOrNull()
 val selectedDraws=remember(draws,active?.first){active?.second.orEmpty().sortedByDescending{it.date}}
 val activeGame=active?.second?.firstOrNull()?.game?:game.id
 val rule=selectedDraws.firstOrNull()?.let{Rules.forDraw(it.game,LocalDate.parse(it.date))}
  ?:Rules.forDraw(game.id,Rules.cutover)
 val chosen=remember(game.id,active?.first){mutableStateListOf<Int>()}
 val report=remember(selectedDraws,chosen.toList(),activeGame){
  if(chosen.size!=2 || selectedDraws.isEmpty())null
  else runCatching{NumberCompare.analyse(selectedDraws,activeGame,chosen[0],chosen[1])}.getOrNull()
 }
 var error by remember(game.id){mutableStateOf<String?>(null)}
 val exportCsv=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("text/csv")){uri->
  if(uri!=null && report!=null)runCatching{Exports.csv(context,uri,ResearchCsv.comparison(report))}
   .onFailure{error="CSV export failed: ${it.message}"}
 }
 val exportPdf=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/pdf")){uri->
  if(uri!=null && report!=null)runCatching{
   Exports.pdf(context,uri,"Two-number research: ${report.first.number} & ${report.second.number}",listOf(
    "Game: ${report.game} • Rule: ${report.ruleId}",
    "Loaded draws: ${report.sampleSize}",
    "${report.first.number}: observed ${report.first.hits}, expected average ${short(report.first.expectedHits)}",
    "${report.second.number}: observed ${report.second.hits}, expected average ${short(report.second.expectedHits)}",
    "Together: observed ${report.jointHits}, expected average ${short(report.expectedJointHits)}",
    "Both-number dates: ${report.jointDates.take(30).joinToString(", ")}",
    "Historical provider data only. Not predictions or proof of results."
   ))
  }.onFailure{error="PDF export failed: ${it.message}"}
 }
 Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
  Text("Compare Two Numbers",style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold)
  Note("Compare how often two main numbers appeared separately and together against their mathematical expected averages. Each fair draw is independent.")
  if(eras.isEmpty()){
   Note("No suitable stored draws for this game. Refresh when connected. Missing history is not treated as zero appearances.")
  }else{
   Text("Game and rule period",fontWeight=FontWeight.SemiBold)
   PeriodPicker(eras.map{it.first},active?.first?:""){era=it}
   Panel{
    Text(active!!.first.replace("|"," • "),fontWeight=FontWeight.Bold)
    Text("${selectedDraws.size} stored draws • ${selectedDraws.last().date} to ${selectedDraws.first().date}",style=MaterialTheme.typography.bodySmall)
    Text("An incomplete archive can distort historical comparisons.",style=MaterialTheme.typography.bodySmall,color=Muted)
   }
   if(rule!=null){
    Text("Tap any two main numbers",fontWeight=FontWeight.SemiBold)
    TicketNumberGrid(rule.max,chosen.toSet()){n->
     if(n in chosen)chosen.remove(n)
     else if(chosen.size<2)chosen.add(n)
     else {chosen.clear();chosen.add(n)}
    }
    Row(horizontalArrangement=Arrangement.spacedBy(10.dp)){
     Text("Selected: ${chosen.sorted().joinToString(" and ").ifBlank{"None"}}",modifier=Modifier.weight(1f),style=MaterialTheme.typography.bodyMedium)
     TextButton(onClick={chosen.clear()}){Text("Clear")}
    }
    report?.let{r->
     Panel{
      Text("Observed versus expected",fontWeight=FontWeight.Bold)
      Text("Main number ${r.first.number}: ${r.first.hits} observed; ${short(r.first.expectedHits)} expected on average")
      Text("Main number ${r.second.number}: ${r.second.hits} observed; ${short(r.second.expectedHits)} expected on average")
      Text("Both together: ${r.jointHits} observed; ${short(r.expectedJointHits)} expected on average",fontWeight=FontWeight.SemiBold)
      Text("Either number appeared in ${short(100*r.eitherNumberDrawRate)}% of stored draws.")
      Text("These averages are calculated for ${r.sampleSize} draws and the selected rule's number range.",style=MaterialTheme.typography.bodySmall,color=Muted)
     }
     Panel{
      Text("Most recent appearances",fontWeight=FontWeight.Bold)
      Text("${r.first.number}: ${r.first.lastSeen?:"Not seen in the loaded records"}")
      Text("${r.second.number}: ${r.second.lastSeen?:"Not seen in the loaded records"}")
      Text("Appeared together on ${r.jointHits} draw${if(r.jointHits==1)"" else "s"}")
      r.jointDates.take(15).forEach{Text(it)}
      if(r.jointDates.size>15)Text("Showing 15 of ${r.jointDates.size} joint dates. Export CSV for the full list.",color=Muted,style=MaterialTheme.typography.bodySmall)
     }
     Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){
      OutlinedButton(onClick={exportCsv.launch("LottoLab-Number-Comparison.csv")},modifier=Modifier.weight(1f)){Text("Export CSV")}
      OutlinedButton(onClick={exportPdf.launch("LottoLab-Number-Comparison.pdf")},modifier=Modifier.weight(1f)){Text("Export PDF")}
     }
    }
    if(chosen.size<2)Note("Choose a second number to calculate a comparison.")
   }
  }
  error?.let{Text(it,color=MaterialTheme.colorScheme.error)}
 }
}
private fun short(n:Double)=String.format(Locale.US,"%.2f",n)
