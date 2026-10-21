package za.co.lottolab.next

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import za.co.lottolab.core.*
import java.time.LocalDate

/**
 * Main numbers only. Each comparison selects one historical game and one
 * rule period, never a misleading aggregate across changing ball ranges.
 */
@Composable
fun CombinationExplorerPanel(game:Game,draws:List<Draw>) {
 val all=remember(draws,game.id) {
  draws.filter{Games.family(it.game)==game.id}
 }
 val eras=remember(all){
  all.groupBy{it.game+"|"+it.ruleId}.toList()
   .sortedByDescending{(_,rows)->rows.maxOf{it.date}}
 }
 var period by rememberSaveable(game.id){mutableStateOf("")}
 val active=eras.firstOrNull{it.first==period}?:eras.firstOrNull()
 val selectedDraws=remember(all,active?.first){if(active==null)emptyList() else active.second.sortedByDescending{it.date}}
 val activeGame=active?.second?.firstOrNull()?.game?:game.id
 val eraRule=selectedDraws.firstOrNull()?.let{
  Rules.forDraw(it.game,LocalDate.parse(it.date))
 }?:Rules.forDraw(game.id,Rules.cutover)
 val chosen=remember(game.id,active?.first){mutableStateListOf<Int>()}
 var show by remember(game.id,active?.first){mutableIntStateOf(20)}
 val report=remember(selectedDraws,chosen.toList(),activeGame) {
  if(chosen.isEmpty()||selectedDraws.isEmpty())null
  else runCatching{CombinationResearch.analyse(selectedDraws,chosen.toList(),activeGame)}.getOrNull()
 }
 val exportContext=LocalContext.current
 var csvError by remember(game.id){mutableStateOf<String?>(null)}
 val exportCsv=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("text/csv")){uri->
  if(uri!=null && report!=null)runCatching{Exports.csv(exportContext,uri,ResearchCsv.combination(report))}
   .onFailure{csvError="CSV export failed: ${it.message}"}
 }
 Column(verticalArrangement=Arrangement.spacedBy(12.dp)) {
  Text("Number Combination Explorer",style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold)
  Note("See how often your chosen numbers appeared together in the loaded historical draws. This is research, not a prediction.")
  if(eras.isEmpty()) {
   Note("There are no valid archived results for this game. Refresh results when connected; no history will be invented.")
  } else {
   Text("Choose a game and rule period",fontWeight=FontWeight.SemiBold)
   PeriodPicker(eras.map{it.first},active?.first?:""){period=it;show=20}
   Text("Selected: ${active!!.first.replace("|"," • ")}",color=Muted,style=MaterialTheme.typography.bodySmall)
   Panel {
    Text("${selectedDraws.size} available draws",fontWeight=FontWeight.Bold)
    Text("Archive covers ${selectedDraws.last().date} to ${selectedDraws.first().date}",style=MaterialTheme.typography.bodySmall)
    Text("Only this game and rule period are counted. The archive may be incomplete.",style=MaterialTheme.typography.bodySmall,color=Muted)
   }
   if(eraRule!=null){
    Text("Choose 1–${eraRule.count} main numbers",fontWeight=FontWeight.SemiBold)
    TicketNumberGrid(eraRule.max,chosen.toSet()){n->
     if(n in chosen)chosen.remove(n) else if(chosen.size<eraRule.count)chosen.add(n)
     show=20
    }
    Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){
     OutlinedButton(onClick={chosen.clear();show=20},enabled=chosen.isNotEmpty()){Text("Clear")}
     Text("${chosen.size} / ${eraRule.count} selected",modifier=Modifier.padding(top=12.dp),color=Muted)
    }
    report?.let{r->
     Panel{
      Text("${r.fullOccurrences} of ${r.sampleSize} draws contained all ${chosen.size} selected numbers",fontWeight=FontWeight.Bold)
      Text("Best historical match: ${r.bestMatch} of ${chosen.size}")
      Text("For this available archive only • main numbers, excluding bonus/PowerBall",color=Muted,style=MaterialTheme.typography.bodySmall)
     }
     Panel{
      Text("Historical match breakdown",fontWeight=FontWeight.Bold)
      (0..chosen.size).reversed().forEach{k->Text("$k of ${chosen.size} numbers: ${r.histogram[k]} draws")}
      Text("0 matches are included to account for all loaded draws.",style=MaterialTheme.typography.bodySmall,color=Muted)
     }
     OutlinedButton(onClick={exportCsv.launch("LottoLab-Combination-Research.csv")},modifier=Modifier.fillMaxWidth()){Text("Export complete research CSV")}
     csvError?.let{Text(it,color=MaterialTheme.colorScheme.error)}
     Text("Closest historical draws",fontWeight=FontWeight.Bold)
     if(r.matchingDraws.isEmpty())Note("None of the selected numbers appeared in the loaded draws for this period.")
     r.matchingDraws.take(show).forEach{hit->
      Panel{
       Text("${hit.draw.date} • ${hit.count} of ${chosen.size} numbers matched",fontWeight=FontWeight.SemiBold)
       Balls(hit.draw.numbers,hit.draw.special,Color(game.color))
       Text("Matched: ${hit.matched.joinToString(", ")}",style=MaterialTheme.typography.bodySmall)
      }
     }
     if(r.matchingDraws.size>show)OutlinedButton(onClick={show+=20}){Text("Show 20 more")}
    }
    if(chosen.isEmpty())Note("Select any number to begin. Multiple selections show joint appearances and partial historical matches.")
   }
  }
 }
}

/** Saved ticket lines are compared only within the same game and draw date. */
@Composable
fun TicketPortfolioPanel(tickets:List<Ticket>) {
 var purchased by rememberSaveable{mutableStateOf(true)}
 var gameId by rememberSaveable{mutableStateOf("All games")}
 var showGroups by rememberSaveable{mutableIntStateOf(12)}
 val gameOptions=listOf("All games")+Games.all.map{it.title}
 val report=remember(tickets,purchased,gameId) {
  val selected=tickets.filter{it.purchased==purchased}
   .filter{gameId=="All games"||Games.get(it.game).title==gameId}
   .mapNotNull{t->runCatching{
    PortfolioLine(t.game,t.date,t.line(),t.purchased,t.costCents)
   }.getOrNull()}
  PortfolioResearch.analyse(selected)
 }
 val exportContext=LocalContext.current
 var csvError by remember{mutableStateOf<String?>(null)}
 val exportCsv=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("text/csv")){uri->
  if(uri!=null)runCatching{Exports.csv(exportContext,uri,ResearchCsv.portfolio(report))}
   .onFailure{csvError="CSV export failed: ${it.message}"}
 }
 Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
  Text("Ticket Portfolio Analyser",style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold)
  Note("Find repeated number lines and overlaps in your saved tickets. A repeat on a different draw date is not counted as a duplicate.")
  Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){
   FilterChip(purchased,{purchased=true;showGroups=12},label={Text("Purchased")})
   FilterChip(!purchased,{purchased=false;showGroups=12},label={Text("Favourites")})
  }
  PeriodPicker(gameOptions,gameId){gameId=it;showGroups=12}
  Panel {
   Text("${report.totalLines} saved entries",fontWeight=FontWeight.Bold)
   Text("${report.uniqueEntries} distinct entries by game and draw date")
   Text("${report.duplicateEntries} additional identical entries",fontWeight=FontWeight.SemiBold)
   if(purchased)Text("Recorded cost: ${money(report.costCents)}")
   Text("Two identical purchased lines can represent separate paid entries, but do not cover an additional distinct jackpot combination for that draw.",style=MaterialTheme.typography.bodySmall,color=Muted)
  }
  if(report.totalLines>0){
   OutlinedButton(onClick={exportCsv.launch("LottoLab-Ticket-Portfolio.csv")},modifier=Modifier.fillMaxWidth()){Text("Export portfolio CSV")}
   csvError?.let{Text(it,color=MaterialTheme.colorScheme.error)}
  }
  if(report.totalLines==0)Note("Save ticket lines first to analyse your portfolio.")
  if(report.duplicates.isNotEmpty()) {
   Text("Repeated combinations",fontWeight=FontWeight.Bold)
   report.duplicates.take(15).forEach{d->
    Panel {
     Text("${Games.get(d.game).title} • ${d.date}",fontWeight=FontWeight.SemiBold)
     Text("${d.quantity} identical entries")
     Balls(d.line.numbers,d.line.special,Color(Games.get(d.game).color))
    }
   }
   if(report.duplicates.size>15)Text("Showing 15 of ${report.duplicates.size} repeated-combination groups.",color=Muted,style=MaterialTheme.typography.bodySmall)
  }
  if(report.groups.isNotEmpty()){
   Text("Entries by game and draw",fontWeight=FontWeight.Bold)
   report.groups.take(showGroups).forEach{g->
    Panel{
     Text("${Games.get(g.game).title} • ${g.date}",fontWeight=FontWeight.SemiBold)
     Text("${g.lines} entries • ${g.uniqueLines} distinct • ${g.duplicateEntries} repeated")
     if(purchased)Text("Recorded: ${money(g.costCents)}")
     Text(if(g.maxMainOverlap==null)"Overlap not calculated for large groups" else "Largest main-number overlap between different entries: ${g.maxMainOverlap}",style=MaterialTheme.typography.bodySmall,color=Muted)
    }
   }
   if(report.groups.size>showGroups)OutlinedButton(onClick={showGroups+=12}){Text("Show more draws")}
  }
  Note("This does not increase the chance that any chosen combination will win. Plan spending against your own budget.")
 }
}

/** Transparent source and completeness information, not fake 'official' verification. */
@Composable
fun ResultsCoveragePanel(draws:List<Draw>) {
 val context=LocalContext.current
 Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
  Text("Results & Source Coverage",style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold)
  Note("Results are reported by external providers. LottoLab is not the lottery operator and does not independently validate physical tickets or prize claims.")
  Games.all.forEach{g->
   val current=remember(draws,g.id){draws.filter{it.game==g.id && it.date>="2026-06-01"}.sortedByDescending{it.date}}
   val coverage=remember(draws,g.id){CoverageAudit.inspect(g.id,draws,LocalDate.now(java.time.ZoneId.of("Africa/Johannesburg")))}
   Panel{
    Text(g.title,fontWeight=FontWeight.Bold)
    Text("${current.size} current-rule draws stored on this device")
    if(current.isEmpty()){
     Text("No supported result records available",color=Muted)
     if(g.id=="lotto-5-max")Text("This game's feed is currently incomplete. Do not rely on the archive as comprehensive.",style=MaterialTheme.typography.bodySmall)
    } else {
     val latest=current.first()
     Text("Latest stored result: ${latest.date}")
     Text("Historical coverage begins: ${current.last().date}")
     Text("Latest source: ${latest.source}")
     Text("Prize breakdown records: ${current.count{it.prizes.isNotEmpty()}} of ${current.size}")
     if(coverage.since!=null){
      Text("Calendar audit since ${coverage.since}: ${coverage.storedDraws} of ${coverage.expectedDraws} scheduled past draws loaded",style=MaterialTheme.typography.bodySmall)
      if(coverage.missingDates.isNotEmpty())Text("Missing from local records: ${coverage.missingDates.take(6).joinToString(", ")}${if(coverage.missingDates.size>6)" (+${coverage.missingDates.size-6} more)" else ""}",style=MaterialTheme.typography.bodySmall,color=Muted)
     }
     Text("Last result retrieval: ${latest.retrievedAt.ifBlank{"Not recorded"}}",style=MaterialTheme.typography.bodySmall,color=Muted)
    }
   }
  }
  OutlinedButton(onClick={
   context.startActivity(Intent(Intent.ACTION_VIEW,Uri.parse("https://www.nationallottery.co.za/")))
  },modifier=Modifier.fillMaxWidth()){
   Text("Check the operator's official website ↗")
  }
  Note("Missing records and missing prize divisions mean unavailable information, not a losing ticket or a zero-value prize. Updates require an internet connection.")
 }
}
