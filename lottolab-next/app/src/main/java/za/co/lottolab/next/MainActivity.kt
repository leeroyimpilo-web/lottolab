package za.co.lottolab.next

import android.Manifest
import android.os.Bundle
import android.os.Build
import android.content.Intent
import android.net.Uri
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.*
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import kotlinx.coroutines.launch
import za.co.lottolab.core.*
import java.time.*
import java.time.format.DateTimeFormatter
import java.util.Locale

val Green=Color(0xFF123E33)
val Ink=Color(0xFF182D29)
val Muted=Color(0xFF60736D)
val Gold=Color(0xFFFFC928)
fun money(cents:Long)=String.format(Locale.US,"R %,.2f",cents/100.0)
fun today()=LocalDate.now(ZoneId.of("Africa/Johannesburg")).toString()

class MainActivity:ComponentActivity(){override fun onCreate(savedInstanceState:Bundle?){super.onCreate(savedInstanceState);setContent{
 MaterialTheme(colorScheme=lightColorScheme(primary=Green,secondary=Gold,background=Color(0xFFF4F7F5),surface=Color.White,onSurface=Ink,onBackground=Ink)){LottoScreen()}
}}}

@OptIn(ExperimentalMaterial3Api::class)
@Composable fun LottoScreen(vm:LottoViewModel=viewModel()){
 val draws by vm.draws.collectAsStateWithLifecycle();val tickets by vm.tickets.collectAsStateWithLifecycle();val alerts by vm.alerts.collectAsStateWithLifecycle();val syndicates by vm.syndicates.collectAsStateWithLifecycle()
 val busy by vm.busy.collectAsStateWithLifecycle();val message by vm.message.collectAsStateWithLifecycle()
 var page by rememberSaveable{mutableStateOf("Home")};var gameId by rememberSaveable{mutableStateOf("lotto")};var details by remember{mutableStateOf<Draw?>(null)}
 val g=Games.get(gameId);val drawer=rememberDrawerState(DrawerValue.Closed);val scope=rememberCoroutineScope();val snackbar=remember{SnackbarHostState()};val context=LocalContext.current
 val permission=rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()){}
 val pages=listOf("Home","My Tickets","Generate Numbers","Compare Two Numbers","Combination Explorer","Ticket Portfolio","Explore Numbers","Draw History","My Spending","Advanced Tools","Syndicates","Results & Sources","Backup & Export","Rules & Help")
 LaunchedEffect(message){message?.let{snackbar.showSnackbar(it);vm.message.value=null}}
 BackHandler(page!="Home" || details!=null){if(details!=null)details=null else page="Home"}
 ModalNavigationDrawer(drawerState=drawer,drawerContent={ModalDrawerSheet(modifier=Modifier.verticalScroll(rememberScrollState())){
  Column(Modifier.padding(24.dp)){Text("LottoLab",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Black);Text("Your numbers. Clearly.",color=Muted)}
  pages.forEach{p->NavigationDrawerItem(label={Text(p)},selected=page==p,onClick={page=p;scope.launch{drawer.close()}},modifier=Modifier.padding(horizontal=12.dp))}
 }}){
 Scaffold(topBar={TopAppBar(title={Column{Text(if(page=="Home")"LottoLab" else page,fontWeight=FontWeight.Bold);Text(LocalDate.now(ZoneId.of("Africa/Johannesburg")).format(DateTimeFormatter.ofPattern("EEE, d MMM yyyy")),style=MaterialTheme.typography.labelSmall,color=Muted)}},navigationIcon={IconButton(onClick={scope.launch{drawer.open()}}){Icon(Icons.Default.Menu,"Open menu")}},actions={IconButton(onClick={vm.refresh()},enabled=!busy){Icon(Icons.Default.Refresh,"Update results")};IconButton(onClick={page="Notifications"}){Icon(Icons.Default.NotificationsNone,"Notifications")}})},
 snackbarHost={SnackbarHost(snackbar)},bottomBar={if(page=="Home")Surface(shadowElevation=6.dp){Button(onClick={page="Check Ticket"},modifier=Modifier.navigationBarsPadding().fillMaxWidth().padding(16.dp),shape=RoundedCornerShape(14.dp),colors=ButtonDefaults.buttonColors(containerColor=Gold,contentColor=Ink)){Icon(Icons.Default.FactCheck,null);Spacer(Modifier.width(10.dp));Text("Check Ticket",Modifier.padding(7.dp),fontWeight=FontWeight.Bold)}}}){padding->
 LazyColumn(Modifier.fillMaxSize().padding(padding),contentPadding=PaddingValues(18.dp),verticalArrangement=Arrangement.spacedBy(14.dp)){
  if(busy)item{LinearProgressIndicator(Modifier.fillMaxWidth())}
  if(page!="Home")item{TextButton(onClick={page="Home"}){Icon(Icons.AutoMirrored.Filled.ArrowBack,null);Text(" Home")}}
  if(page in listOf("Check Ticket","Generate Numbers","Compare Two Numbers","Combination Explorer","Explore Numbers","Draw History","Advanced Tools"))item{GamePicker(g){gameId=it}}
  when(page){
   "Home"->{
    item{Text("All your results.\nOne clear view.",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold);Text("South Africa • Current game rules",color=Muted,modifier=Modifier.padding(top=6.dp))}
    item{DataFreshness(draws)}
    item{Panel{
     Text("Research your numbers",fontWeight=FontWeight.Bold)
     Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){
      OutlinedButton(onClick={page="Combination Explorer"},modifier=Modifier.weight(1f)){Text("Combinations")}
      OutlinedButton(onClick={page="Ticket Portfolio"},modifier=Modifier.weight(1f)){Text("My portfolio")}
     }
    }}
    Games.all.forEach{game->item{val d=draws.firstOrNull{it.game==game.id && it.date>="2026-06-01"};ResultCard(game,d){details=d}}}
    item{SourceLink()}
   }
   "Check Ticket"->item{TicketEntry(g,draws,vm)}
   "My Tickets"->item{TicketList(tickets,draws,vm)}
   "Generate Numbers"->item{GeneratePanel(g,vm)}
   "Compare Two Numbers"->item{NumberComparisonPanel(g,draws)}
   "Combination Explorer"->item{CombinationExplorerPanel(g,draws)}
   "Ticket Portfolio"->item{TicketPortfolioPanel(tickets)}
   "Results & Sources"->item{ResultsCoveragePanel(draws)}
   "Explore Numbers"->item{ExplorePanel(g,draws)}
   "Draw History"->item{HistoryPanel(g,draws){details=it}}
   "My Spending"->item{SpendingPanel(tickets)}
   "Advanced Tools"->item{WheelPanel(g,vm)}
   "Syndicates"->item{SyndicatePanel(syndicates,vm)}
   "Backup & Export"->item{BackupPanel(tickets,syndicates,vm)}
   "Rules & Help"->item{RulesPanel()}
   "Notifications"->item{Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
    Text("Results and corrections",style=MaterialTheme.typography.titleLarge)
    Button(onClick={if(Build.VERSION.SDK_INT>=33)permission.launch(Manifest.permission.POST_NOTIFICATIONS)else vm.message.value="Notifications are managed in Android settings"}){Text("Enable result notifications")}
    Note("Background refresh runs when Android permits it. Instant server push and draw-cutoff reminders are not enabled in this preview.")
    if(alerts.isEmpty())Note("No updates yet. New results and corrections will appear here.")
    alerts.forEach{a->Panel{Text(a.title,fontWeight=FontWeight.Bold);Text(a.body)}}
   }}
  }
  item{Spacer(Modifier.height(12.dp))}
 }
 }
 }
 details?.let{d->AlertDialog(onDismissRequest={details=null},title={Text("${Games.all.find{it.id==d.game}?.title?:d.game} • ${d.date}")},text={Column(Modifier.verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(8.dp)){
  Balls(d.numbers,d.special,Green)
  Text("Rule period: ${d.ruleId}")
  Text("Source: ${d.source} • Revision ${d.revision}",color=Muted)
  if(d.prizes.isEmpty())Text("Numbers available; payout pending")
  d.prizes.forEach{Text("${it.label}: ${it.cents?.let(::money)?:"Payout pending / no winning tickets"}\n${it.winners?.toString()?:"Unknown"} winners")}
  Text("Provider data, not independent official verification. Confirm any claim with the operator.",style=MaterialTheme.typography.bodySmall)
 }},confirmButton={TextButton(onClick={details=null}){Text("Done")}})}
}
@Composable fun Panel(content:@Composable ColumnScope.()->Unit){Card(shape=RoundedCornerShape(18.dp),colors=CardDefaults.cardColors(containerColor=Color.White),modifier=Modifier.fillMaxWidth()){Column(Modifier.padding(18.dp),verticalArrangement=Arrangement.spacedBy(10.dp),content=content)}}
@Composable fun Note(text:String){Surface(color=Color(0xFFE8F0EB),shape=RoundedCornerShape(12.dp)){Text(text,Modifier.padding(12.dp),style=MaterialTheme.typography.bodySmall,color=Green)}}
@Composable fun DataFreshness(draws:List<Draw>){
 val ctx=LocalContext.current
 val lastSync=ctx.getSharedPreferences("sync",0).getLong("lastSync",0L)
 val formatted=if(lastSync>0L)java.time.format.DateTimeFormatter.ofPattern("d MMM yyyy HH:mm",Locale.ENGLISH)
  .withZone(ZoneId.of("Africa/Johannesburg")).format(Instant.ofEpochMilli(lastSync)) else "Not connected yet"
 val latest=draws.maxByOrNull{it.date}?.date?:"None loaded"
 Note("${draws.size} saved draw records • Latest saved draw: $latest • Last successful online check: $formatted. Results are published provider data, not independently official-verified. Saved records work offline.")
}
@Composable fun SourceLink(){val c=LocalContext.current;TextButton(onClick={c.startActivity(Intent(Intent.ACTION_VIEW,Uri.parse("https://bettip.co.za/")))}){Text("Results data by BetTip ↗")}}
@Composable fun GamePicker(g:Game,onChange:(String)->Unit){var expanded by remember{mutableStateOf(false)};Box{OutlinedButton(onClick={expanded=true},modifier=Modifier.fillMaxWidth()){Text(g.title,Modifier.weight(1f));Icon(Icons.Default.ExpandMore,null)};DropdownMenu(expanded,onDismissRequest={expanded=false}){Games.all.forEach{DropdownMenuItem(text={Text(it.title)},onClick={onChange(it.id);expanded=false})}}}}
@Composable fun Balls(numbers:List<Int>,special:Int?,color:Color){Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(5.dp)){numbers.forEach{n->Box(Modifier.weight(1f).aspectRatio(1f).background(color.copy(alpha=.13f),CircleShape),contentAlignment=Alignment.Center){Text(n.toString().padStart(2,'0'),fontWeight=FontWeight.Bold,color=Ink,fontSize=16.sp)}};special?.let{n->Box(Modifier.weight(1f).aspectRatio(1f).background(color,CircleShape),contentAlignment=Alignment.Center){Text(n.toString().padStart(2,'0'),fontWeight=FontWeight.Bold,color=if(color==Gold)Ink else Color.White,fontSize=16.sp)}}}}
@Composable fun ResultCard(g:Game,d:Draw?,onClick:()->Unit){
 Card(onClick=onClick,shape=RoundedCornerShape(18.dp),colors=CardDefaults.cardColors(containerColor=Color.White)){
  Box(Modifier.fillMaxWidth().height(5.dp).background(Color(g.color)))
  Column(Modifier.padding(17.dp),verticalArrangement=Arrangement.spacedBy(12.dp)){
   Row(verticalAlignment=Alignment.CenterVertically){Text(g.title,style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold,modifier=Modifier.weight(1f));Icon(Icons.Default.ChevronRight,null,tint=Muted)}
   Text(d?.date?:g.days,color=Muted,style=MaterialTheme.typography.labelLarge)
   if(d!=null){Balls(d.numbers,d.special,Color(g.color));Text(if(g.specialMax>0)"Last ball: PowerBall" else if(g.count==6)"Last ball: bonus" else "5 winning numbers",color=Muted,style=MaterialTheme.typography.labelSmall);Text(if(d.prizes.isEmpty())"Numbers available • Payout pending" else "View published prize breakdown",style=MaterialTheme.typography.labelMedium,color=Green)}
   else Note("No result available from the connected feed. This game's tools remain available.")
  }
 }
}
@Composable fun Field(value:String,onChange:(String)->Unit,label:String,single:Boolean=true){OutlinedTextField(value,onChange,label={Text(label)},singleLine=single,modifier=Modifier.fillMaxWidth(),shape=RoundedCornerShape(12.dp))}
@Composable fun TicketEntry(g:Game,draws:List<Draw>,vm:LottoViewModel){
 var input by rememberSaveable(g.id){mutableStateOf("")}
 var date by rememberSaveable(g.id){mutableStateOf(today())}
 var purchased by rememberSaveable{mutableStateOf(false)}
 var drawCount by rememberSaveable(g.id){mutableStateOf("1")}
 var checks by remember{mutableStateOf<List<Pair<Line,Check>>>(emptyList())}
 var error by remember{mutableStateOf<String?>(null)}
 var scanNeedsReview by remember(g.id){mutableStateOf(false)}
 var scanMessage by remember(g.id){mutableStateOf<String?>(null)}
 val c=LocalContext.current
 val photo=rememberLauncherForActivityResult(ActivityResultContracts.GetContent()){uri->
  if(uri!=null){
   runCatching {
    val recognizer=TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
    recognizer.process(InputImage.fromFilePath(c,uri))
     .addOnSuccessListener {result->
      val parsed=TicketScanParser.read(result.text,g)
      input=if(parsed.lines.isNotEmpty())parsed.lines.joinToString("\n"){it.display()} else result.text
      checks=emptyList()
      scanNeedsReview=true
      scanMessage=if(parsed.lines.isNotEmpty())
       "${parsed.lines.size} complete lines extracted. ${parsed.skippedCandidates} possible incomplete lines skipped. Check each line and the draw date carefully. No ticket has been validated or saved."
      else "No complete number lines could be recognised. Edit the extracted text to leave one valid number line per row."
      error=null
     }
     .addOnFailureListener{error=it.message?:"Unable to read ticket photo"}
     .addOnCompleteListener{recognizer.close()}
   }.onFailure{error=it.message}
  }
 }
 Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
  Text("Check your numbers",style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold)
  Note("Select the game and exact draw date. This checker does not validate a physical ticket with the lottery operator.")
  Field(date,{date=it;checks=emptyList()},"Draw date • YYYY-MM-DD")
  TicketNumberPad(g){line->
   input=if(input.isBlank())line.display() else input.trimEnd()+"\n"+line.display()
   checks=emptyList()
  }
  Field(input,{input=it;checks=emptyList()},"${g.count} numbers from 1–${g.max}"+(if(g.specialMax>0)" + PowerBall 1–${g.specialMax}" else "")+" • one line per row",false)
  val parsedInput=remember(input,g.id){runCatching{parseLines(input,g)}.getOrNull()}
  if(parsedInput!=null)Text("${parsedInput.size} complete line${if(parsedInput.size==1)"" else "s"} ready for checking",color=Muted,style=MaterialTheme.typography.labelMedium)
  TextButton(onClick={photo.launch("image/*")}){Icon(Icons.Default.PhotoCamera,null);Text(" Import ticket photo")}
  if(scanNeedsReview){
   Note(scanMessage?:"Review all scanned numbers carefully before continuing.")
   OutlinedButton(onClick={scanNeedsReview=false},modifier=Modifier.fillMaxWidth()){Text("I've checked the extracted numbers and date")}
  }
  Button(
   enabled=!scanNeedsReview,
   onClick={
    runCatching {
     val d=LocalDate.parse(date)
     val eligible=DrawSchedule.nextDates(g.id,d,if(purchased)drawCount.toInt() else 1)
     val firstEligible=eligible.first().toString()
     val lines=parseLines(input,g)
     val draw=draws.find{it.game==g.id && it.date==firstEligible}
     checks=lines.map{it to Checker.check(it,draw)}
     error=null
    }.onFailure{error=it.message}
   },
   modifier=Modifier.fillMaxWidth()
  ){Text("Check these numbers")}
  error?.let{Note(it)}
  checks.forEach{(line,result)->Panel{
   Text(line.display(),fontWeight=FontWeight.Bold)
   Text("${result.matches} main matches"+(if(result.special)" + ${if(g.specialMax>0)"PowerBall" else "bonus"}" else ""))
   Text(result.status,color=Green)
   result.cents?.let{if(it>0)Text("Published payout: ${money(it)}",style=MaterialTheme.typography.titleLarge)}
   if(result.matched.isNotEmpty())Text("Matched: ${result.matched.joinToString()}")
  }}
  Row(verticalAlignment=Alignment.CenterVertically){Checkbox(purchased,{purchased=it;checks=emptyList()});Text("I purchased these lines",Modifier.weight(1f))}
  if(purchased)Field(drawCount,{drawCount=it;checks=emptyList()},"Number of consecutive draws • 1–10")
  val schedule=remember(g.id,date,drawCount,purchased){runCatching{DrawSchedule.nextDates(g.id,LocalDate.parse(date),if(purchased)drawCount.toInt() else 1)}.getOrNull()}
  if(schedule!=null) {
   val first=schedule.first().toString()
   val last=schedule.last().toString()
   Note("Scheduled dates: ${schedule.joinToString(", ")}. ${if(first!=date)"The first eligible draw is $first, not the entered date. " else ""}When saved, each draw is checked separately as results arrive.")
   if(purchased)Text("Estimated ${schedule.size} draw(s) × ${parsedInput?.size?:0} line(s) × ${money(g.priceCents.toLong())} = ${money(schedule.size.toLong()*(parsedInput?.size?:0)*g.priceCents.toLong())}",style=MaterialTheme.typography.bodyMedium,fontWeight=FontWeight.Medium)
  }else Note("Enter a valid starting date and a draw count from 1 to 10.")
  Text(if(purchased)"Each selected draw is recorded separately, with the displayed estimated base price per line. Add-on prices do not include required parent-game entries. Check the actual ticket receipt." else "Save as favourites. No spending or winnings recorded.",style=MaterialTheme.typography.bodySmall,color=Muted)
  OutlinedButton(
   enabled=!scanNeedsReview && schedule!=null,
   onClick={runCatching{
    val lines=parseLines(input,g)
    vm.saveAcrossDraws(g,lines,date,if(purchased)drawCount.toInt() else 1,purchased)
    error=null
   }.onFailure{error=it.message}},
   modifier=Modifier.fillMaxWidth()
  ){Text(if(purchased)"Save purchased ticket" else "Save favourites")}
 }
}

@Composable fun GeneratePanel(g:Game,vm:LottoViewModel){
 var count by rememberSaveable{mutableStateOf("5")};var locked by rememberSaveable(g.id){mutableStateOf("")};var excluded by rememberSaveable(g.id){mutableStateOf("")};var odd by rememberSaveable(g.id){mutableStateOf("")};var min by rememberSaveable{mutableStateOf("")};var max by rememberSaveable{mutableStateOf("")};var spread by rememberSaveable{mutableStateOf("")};var consecutive by rememberSaveable{mutableStateOf(false)};var custom by rememberSaveable{mutableStateOf(false)};var lines by remember(g.id){mutableStateOf<List<Line>>(emptyList())};var error by remember{mutableStateOf<String?>(null)};var working by remember{mutableStateOf(false)}
 val c=LocalContext.current;val scope=rememberCoroutineScope()
 val export=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/pdf")){uri->if(uri!=null)runCatching{Exports.pdf(c,uri,"${g.title} • Generated numbers",lines.map{it.display()})}.onFailure{error=it.message}}
 Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
  Text("Make your next lines",style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold)
  Note("Every valid combination has the same jackpot chance. Filters express your preferences; they do not predict a draw.")
  GeneratorPresetShelf(g,GeneratorSettings(count,locked,excluded,odd,min,max,spread,consecutive,custom)){settings->
   count=settings.count
   locked=settings.locked
   excluded=settings.excluded
   odd=settings.odd
   min=settings.sumMin
   max=settings.sumMax
   spread=settings.spread
   consecutive=settings.noConsecutive
   custom=settings.custom
   lines=emptyList()
   error=null
  }
  Field(count,{count=it},"Number of unique lines • 1–100")
  Field(locked,{locked=it},"Lock favourite numbers • optional")
  Field(excluded,{excluded=it},"Exclude numbers • optional")
  Row(verticalAlignment=Alignment.CenterVertically){Switch(custom,{custom=it});Text("  Custom filters")}
  if(custom){Field(odd,{odd=it},"Exact odd count • optional");Field(min,{min=it},"Minimum sum • optional");Field(max,{max=it},"Maximum sum • optional");Field(spread,{spread=it},"Minimum spread • optional");Row(verticalAlignment=Alignment.CenterVertically){Checkbox(consecutive,{consecutive=it});Text("Exclude consecutive numbers")}}
  Button(enabled=!working,onClick={scope.launch{working=true;runCatching{
   val filters=Filters(parseNumbers(locked).toSet(),parseNumbers(excluded).toSet(),if(custom)odd.takeIf{it.isNotBlank()}?.toInt() else null,if(custom)min.takeIf{it.isNotBlank()}?.toInt() else null,if(custom)max.takeIf{it.isNotBlank()}?.toInt() else null,custom && consecutive,if(custom)spread.takeIf{it.isNotBlank()}?.toInt() else null)
   lines=kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.Default){Generator.generate(g,count.toInt(),filters)};error=null
  }.onFailure{error=it.message};working=false}},modifier=Modifier.fillMaxWidth()){Text(if(working)"Generating…" else "Generate numbers")}
  error?.let{Note(it)}
  Text("Jackpot chance per line: 1 in ${String.format(Locale.US,"%,d",jackpotOutcomes(g))}",style=MaterialTheme.typography.bodySmall)
  if(lines.isNotEmpty()){
   Text("${lines.size} distinct lines • ${money(lines.size*g.priceCents.toLong())} for this game",fontWeight=FontWeight.Bold)
   lines.forEachIndexed{i,l->Panel{Text("LINE ${i+1}",style=MaterialTheme.typography.labelSmall,color=Muted);Balls(l.numbers,l.special,Color(g.color))}}
   Button(onClick={vm.save(g,lines,today(),false)},modifier=Modifier.fillMaxWidth()){Text("Save as favourites")}
   Row{TextButton(onClick={Exports.share(c,"${g.title}\n"+lines.joinToString("\n"){it.display()}+"\nGenerated by LottoLab. Not a purchased ticket.")}){Text("Share / copy")};TextButton(onClick={export.launch("LottoLab-Numbers.pdf")}){Text("Export PDF")}}
   val overlaps=remember(lines){Stats.overlaps(lines)}
   Text("Largest main-number overlap: ${overlaps.maxOfOrNull{it.third}?:0} • Duplicate lines: 0",color=Muted,style=MaterialTheme.typography.bodySmall)
  }
 }
}

@Composable fun TicketList(tickets:List<Ticket>,draws:List<Draw>,vm:LottoViewModel){
 var purchased by rememberSaveable{mutableStateOf(true)}
 var filter by rememberSaveable{mutableStateOf("All")}
 var receipt by remember{mutableStateOf<Ticket?>(null)}
 var amount by remember{mutableStateOf("")}
 var removing by remember{mutableStateOf<Ticket?>(null)}
 val byDraw=remember(draws){draws.associateBy{it.game to it.date}}
 val todayDate=remember{LocalDate.parse(today())}
 val reviewed=remember(tickets,byDraw,purchased,todayDate) {
  tickets.filter{it.purchased==purchased}.map{t->
   t to (if(!t.purchased)null else runCatching {
    TicketReview.assess(t.game,LocalDate.parse(t.date),t.line(),byDraw[t.game to t.date],todayDate)
   }.getOrNull())
  }
 }
 val visible=reviewed.filter{(_,assessment)->
  if(!purchased)true else when(filter){
   "To check" -> assessment?.state in listOf(TicketState.AWAITING_DRAW,TicketState.RESULT_NOT_LOADED,TicketState.PAYOUT_UNCONFIRMED)
   "Possible prizes" -> assessment?.state==TicketState.PUBLISHED_PAYOUT
   "Completed" -> assessment?.state==TicketState.NO_PRIZE
   else -> true
  }
 }
 Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
  Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){FilterChip(purchased,{purchased=true;filter="All"},label={Text("Purchased")});FilterChip(!purchased,{purchased=false;filter="All"},label={Text("Favourites")})}
  if(purchased) {
   PeriodPicker(listOf("All","To check","Possible prizes","Completed"),filter){filter=it}
   val awaiting=reviewed.count{it.second?.state==TicketState.AWAITING_DRAW}
   val missing=reviewed.count{it.second?.state==TicketState.RESULT_NOT_LOADED}
   val pending=reviewed.count{it.second?.state==TicketState.PAYOUT_UNCONFIRMED}
   val prizes=reviewed.count{it.second?.state==TicketState.PUBLISHED_PAYOUT}
   Panel {
    Text("Your ticket checks",fontWeight=FontWeight.Bold)
    Text("$awaiting future entries • $missing results not loaded")
    Text("$pending awaiting payout details • $prizes possible prizes with published amounts")
    Text("These are independent checks against provider data, not official ticket validation.",style=MaterialTheme.typography.bodySmall,color=Muted)
   }
  }
  if(visible.isEmpty())Note(if(purchased)"No tickets in this category. Purchased entries appear here after you save or scan them." else "Save your favourite numbers from the generator or checker.")
  visible.forEach{(t,assessment)->val g=Games.get(t.game)
   Panel{
    Text(g.title,fontWeight=FontWeight.Bold)
    Text(if(t.purchased)"Draw ${t.date}" else "Favourite • Not purchased",color=Muted)
    if(t.note.isNotBlank())Text(t.note,color=Muted,style=MaterialTheme.typography.bodySmall)
    Balls(t.line().numbers,t.special,Color(g.color))
    if(t.purchased){
     Text(assessment?.description?:"Ticket needs manual review",fontWeight=FontWeight.Medium,color=Green)
     assessment?.check?.let{check->
      Text("${check.matches} main numbers matched"+(if(check.special)" + special ball" else ""))
      check.cents?.takeIf{it>0L}?.let{payout->Text("Published provider payout: ${money(payout)}",style=MaterialTheme.typography.titleLarge)}
     }
     Text("Recorded cost: ${money(t.costCents)} • Actually received: ${t.receivedCents?.let(::money)?:"Not recorded"}",style=MaterialTheme.typography.bodySmall)
     TextButton(onClick={receipt=t;amount=""}){Text("Record money received")}
    }else Text("Use these numbers in Check Ticket when you purchase a line.",style=MaterialTheme.typography.bodySmall)
    Row{
     TextButton(onClick={Exports.share(vm.getApplication(),"${g.title}\n${t.line().display()}\n${if(t.purchased)"Draw ${t.date}" else "Favourite — not purchased"}")}){Text("Share")}
     TextButton(onClick={removing=t}){Text("Delete")}
    }
   }
  }
 }
 removing?.let{t->AlertDialog(onDismissRequest={removing=null},title={Text("Delete this line?")},text={Text("This also removes its spending record.")},confirmButton={TextButton(onClick={vm.delete(t);removing=null}){Text("Delete")}},dismissButton={TextButton(onClick={removing=null}){Text("Cancel")}})}
 receipt?.let{t->AlertDialog(onDismissRequest={receipt=null},title={Text("Money actually received")},text={Field(amount,{amount=it},"Amount in rand")},confirmButton={TextButton(onClick={runCatching{val cents=java.math.BigDecimal(amount).multiply(java.math.BigDecimal(100)).longValueExact();require(cents>=0);vm.received(t,cents);receipt=null}.onFailure{vm.message.value="Enter a valid rand amount with at most two decimals"}}){Text("Save")}},dismissButton={TextButton(onClick={receipt=null}){Text("Cancel")}})}
}

@Composable fun SpendingPanel(tickets:List<Ticket>){
 var month by rememberSaveable{mutableStateOf(today().take(7))}
 val selected=tickets.filter{it.purchased && it.date.startsWith(month)};val spent=selected.sumOf{it.costCents};val received=selected.sumOf{it.receivedCents?:0}
 Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
  Field(month,{month=it},"Draw month • YYYY-MM")
  Panel{Text("Your monthly record",style=MaterialTheme.typography.titleLarge);Text("Spent   ${money(spent)}");Text("Received   ${money(received)}");Text("Net spending   ${money(spent-received)}",fontWeight=FontWeight.Bold);Text("${selected.size} purchased lines")}
  Note("Based on purchased tickets for this draw month. Favourites and hypothetical prizes are excluded. Only money you record as received counts as a return.")
  Games.all.forEach{g->val list=selected.filter{it.game==g.id};if(list.isNotEmpty())Panel{Text(g.title,fontWeight=FontWeight.Bold);Text("${list.size} lines • ${money(list.sumOf{it.costCents})} spent")}}
 }
}

@Composable fun PeriodPicker(periods:List<String>,selected:String,onSelect:(String)->Unit){Row(Modifier.horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(8.dp)){periods.forEach{p->FilterChip(selected==p,{onSelect(p)},label={Text(p)})}}}
@Composable fun HistoryPanel(g:Game,draws:List<Draw>,open:(Draw)->Unit){
 var mode by rememberSaveable{mutableStateOf("Current rules")};var search by rememberSaveable{mutableStateOf("")};var period by rememberSaveable(g.id){mutableStateOf("")};var limit by rememberSaveable{mutableIntStateOf(40)}
 val family=remember(draws,g.id){draws.filter{Games.family(it.game)==g.id}}
 val oldPeriods=family.filter{it.date<"2026-06-01"}.map{"${it.game} / ${it.ruleId}"}.distinct()
 val selected=if(mode=="Current rules")family.filter{it.game==g.id && it.date>="2026-06-01"} else family.filter{"${it.game} / ${it.ruleId}"==(period.ifBlank{oldPeriods.firstOrNull()?:""})}
 val filtered=selected.filter{search.isBlank() || it.date.contains(search) || it.id.contains(search) || runCatching{parseNumbers(search).let{n->n.isNotEmpty() && it.numbers.containsAll(n)}}.getOrDefault(false)}
 Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
  PeriodPicker(listOf("Current rules","Previous rules"),mode){mode=it;limit=40}
  if(mode=="Previous rules")PeriodPicker(oldPeriods,period.ifBlank{oldPeriods.firstOrNull()?:""}){period=it}
  Field(search,{search=it;limit=40},"Search date, draw key or number group")
  Text("${filtered.size} matching draws • ${selected.size} loaded in this period",color=Muted)
  if(filtered.isEmpty())Note("No matching records in the downloaded archive. Refresh to check for more data.")
  filtered.take(limit).forEach{d->Card(onClick={open(d)},colors=CardDefaults.cardColors(containerColor=Color.White)){Column(Modifier.padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){Text("${d.date} • ${d.game}",fontWeight=FontWeight.Bold);Balls(d.numbers,d.special,Color(g.color));Text("${d.ruleId} • ${if(d.prizes.isEmpty())"Payout pending" else "Prize details"}",style=MaterialTheme.typography.labelSmall)}}}
  if(filtered.size>limit)TextButton(onClick={limit+=40}){Text("Show 40 more")}
  SourceLink()
 }
}

@Composable fun ExplorePanel(g:Game,draws:List<Draw>){
 var mode by rememberSaveable{mutableStateOf("Current rules")};var period by rememberSaveable(g.id){mutableStateOf("")};var window by rememberSaveable{mutableStateOf("All")};var tab by rememberSaveable{mutableStateOf("Frequency")};var group by rememberSaveable(g.id){mutableStateOf("")};var selectedNumber by remember{mutableStateOf<NumberStat?>(null)};var special by rememberSaveable{mutableStateOf(false)}
 val family=remember(draws,g.id){draws.filter{Games.family(it.game)==g.id}}
 val keys=family.map{"${it.game} / ${it.ruleId}"}.distinct()
 val current=family.filter{it.game==g.id && it.date>="2026-06-01"}
 val base=if(mode=="Current rules")current else family.filter{"${it.game} / ${it.ruleId}"==period.ifBlank{keys.firstOrNull()?:""}}
 val selected=if(window=="All")base else base.take(window.toInt())
 val r=selected.firstOrNull()?.let{Rules.forDraw(it.game,LocalDate.parse(it.date))}?:Rules.forDraw(g.id,LocalDate.parse(today()))!!
 val stats=remember(selected,special,r){Stats.numbers(selected,if(special && r.specialMax>0)r.specialMax else r.max,special)}
 Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
  Text("Understand the history",style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold)
  PeriodPicker(listOf("Current rules","Choose period","Compare periods"),mode){mode=it}
  if(mode=="Compare periods"){
   Note("Rates use only the eligible draws in each separate game and rule period. These are descriptions, not predictions.")
   Field(group,{group=it},"Number to compare")
   val n=group.toIntOrNull()
   keys.forEach{key->val ds=family.filter{"${it.game} / ${it.ruleId}"==key};val rule=Rules.forDraw(ds.first().game,LocalDate.parse(ds.first().date))!!;Panel{Text(key,fontWeight=FontWeight.Bold);Text("${ds.size} draws • ${ds.last().date} to ${ds.first().date}");if(n!=null)Text(if(n in 1..rule.max)"Number $n: ${ds.count{n in it.numbers}} appearances (${String.format(Locale.US,"%.1f",100.0*ds.count{n in it.numbers}/ds.size)}%)" else "Number $n was not eligible")}}
  }else{
   if(mode=="Choose period")PeriodPicker(keys,period.ifBlank{keys.firstOrNull()?:""}){period=it}
   PeriodPicker(listOf("All","20","50","100"),window){window=it}
   Text("${selected.size} draws • ${selected.lastOrNull()?.date?:"—"} to ${selected.firstOrNull()?.date?:"—"}",style=MaterialTheme.typography.bodySmall,color=Muted)
   Note(if(selected.size<100)"Small sample: ${selected.size} draws. Rankings, especially pairs and triples, can change sharply. Past draws do not predict the next result." else "Historical observations only. Every valid combination keeps the same next-draw jackpot probability.")
   PeriodPicker(listOf("Frequency","Chart","Gaps","Pairs","Triples","My numbers","Patterns","Heatmap"),tab){tab=it}
   if(tab=="Frequency" || tab=="Gaps"){
    if(r.specialMax>0)Row(verticalAlignment=Alignment.CenterVertically){Switch(special,{special=it});Text("  PowerBall only")}
    else if(special)LaunchedEffect(Unit){special=false}
    val sorted=if(tab=="Gaps")stats.sortedByDescending{it.gap}else stats.sortedByDescending{it.hits}
    sorted.forEach{s->Surface(onClick={selectedNumber=s},color=Color.White,shape=RoundedCornerShape(10.dp)){Row(Modifier.padding(12.dp),verticalAlignment=Alignment.CenterVertically){Text(s.number.toString().padStart(2,'0'),fontWeight=FontWeight.Bold,modifier=Modifier.width(35.dp));Column(Modifier.weight(1f)){Text(if(tab=="Gaps")"${s.gap} draws since seen" else "${s.hits} appearances • ${String.format(Locale.US,"%.1f",s.rate)}%",style=MaterialTheme.typography.bodySmall);if(tab=="Frequency")LinearProgressIndicator(progress={if(selected.isEmpty())0f else s.hits.toFloat()/selected.size},modifier=Modifier.fillMaxWidth().padding(top=5.dp),color=Color(g.color))};Icon(Icons.Default.ChevronRight,null,tint=Muted)}}}
   }
   if(tab=="Chart"){
     if(r.specialMax>0)Row(verticalAlignment=Alignment.CenterVertically){Switch(special,{special=it});Text("  PowerBall numbers")}
     FrequencyChart(g,stats,selected.size,if(special && r.specialMax>0)1 else r.count,if(special && r.specialMax>0)r.specialMax else r.max)
    }
    if(tab=="Pairs" || tab=="Triples"){
    val groups=remember(selected,tab){Stats.groups(selected,if(tab=="Pairs")2 else 3)}
    groups.take(30).forEach{entry->Panel{Text(entry.key.joinToString(" • "),fontWeight=FontWeight.Bold);Text("${entry.value} of ${selected.size} draws")}}
    if(groups.isEmpty())Note("No records in this period.")
   }
   if(tab=="My numbers"){
    Field(group,{group=it},"Main number group • 1 to ${r.count} numbers")
    val numbers=runCatching{parseNumbers(group).also{require(it.size in 1..r.count && it.distinct().size==it.size && it.all{n->n in 1..r.max})}}.getOrNull()
    if(numbers!=null){val matches=selected.map{it to it.numbers.intersect(numbers.toSet()).size}.sortedWith(compareByDescending<Pair<Draw,Int>>{it.second}.thenByDescending{it.first.date});val exact=matches.count{it.second==numbers.size}
     Panel{Text("Together in $exact of ${selected.size} draws",fontWeight=FontWeight.Bold);Text("Best partial match: ${matches.maxOfOrNull{it.second}?:0} of ${numbers.size}");Text("Historical research only; this does not record winnings.",style=MaterialTheme.typography.bodySmall)}
     matches.filter{it.second>0}.take(30).forEach{(d,m)->Panel{Text("${d.date} • $m matches");Balls(d.numbers,d.special,Color(g.color));Text("Matching: ${d.numbers.intersect(numbers.toSet()).joinToString()}")}}
    }else if(group.isNotBlank())Note("Enter unique numbers within this rule period's range.")
   }
   if(tab=="Patterns"){
    val oddCounts=selected.groupingBy{it.numbers.count{n->n%2==1}}.eachCount()
    Panel{Text("Odd / even",fontWeight=FontWeight.Bold);(0..r.count).forEach{n->Text("$n odd / ${r.count-n} even: ${oddCounts[n]?:0} draws")}}
    val lowCounts=selected.groupingBy{it.numbers.count{n->n<=r.max/2}}.eachCount()
    Panel{Text("Low / high • low = 1–${r.max/2}",fontWeight=FontWeight.Bold);(0..r.count).forEach{n->Text("$n low / ${r.count-n} high: ${lowCounts[n]?:0} draws")}}
    Panel {
     Text("Sums, spread and repeats",fontWeight=FontWeight.Bold)
     if(selected.isNotEmpty()) {
      val averageSum=String.format(Locale.US,"%.1f",selected.map{it.numbers.sum()}.average())
      val averageSpread=String.format(Locale.US,"%.1f",selected.map{it.numbers.max()-it.numbers.min()}.average())
      val consecutiveCount=selected.count{it.numbers.sorted().zipWithNext().any{(a,b)->b-a==1}}
      val repeats=selected.zipWithNext{a,b->a.numbers.intersect(b.numbers.toSet()).size}
      val averageRepeats=if(repeats.isEmpty())"—" else String.format(Locale.US,"%.1f",repeats.average())
      Text("Average sum: $averageSum")
      Text("Average spread: $averageSpread")
      Text("Consecutive numbers: $consecutiveCount draws")
      Text("Average repeats from previous draw: $averageRepeats")
     }
    }
    Note("Common pattern categories contain many different combinations. A particular line in a common category is not more likely than any other valid line.")
   }
   if(tab=="Heatmap"){
    Text("Last 20 selected draws • scroll horizontally",style=MaterialTheme.typography.bodySmall)
    Column(Modifier.horizontalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(3.dp)){
     Row{Text("Draw date",Modifier.width(90.dp),fontSize=10.sp);(1..r.max).forEach{Text(it.toString(),Modifier.width(20.dp),fontSize=9.sp)}}
     selected.take(20).forEach{d->Row{Text(d.date,Modifier.width(90.dp),fontSize=10.sp);(1..r.max).forEach{n->Box(Modifier.size(20.dp).padding(1.dp).background(if(n in d.numbers)Green else Color(0xFFE1E8E4)))}}}
    }
   }
   SourceLink()
  }
 }
 selectedNumber?.let{s->AlertDialog(onDismissRequest={selectedNumber=null},title={Text("Number ${s.number}")},text={Column(verticalArrangement=Arrangement.spacedBy(8.dp)){Text("${s.hits} appearances in ${selected.size} draws");Text("Last seen: ${s.lastSeen?:"Not seen in selected window"}");Text("Current observed gap: ${s.gap} draws");Text("Average completed gap: ${s.averageGap?.let{String.format(Locale.US,"%.1f",it)}?:"Not enough appearances"}");Text("Longest observed gap: ${s.longestGap}");Text("Window-edge gaps may be incomplete. An absence does not make this number more likely next time.")}},confirmButton={TextButton(onClick={selectedNumber=null}){Text("Done")}})}
}

@Composable fun WheelPanel(g:Game,vm:LottoViewModel){
 var pool by rememberSaveable(g.id){mutableStateOf("")};var pb by rememberSaveable(g.id){mutableStateOf("")};var lines by remember(g.id){mutableStateOf<List<Line>>(emptyList())};var error by remember{mutableStateOf<String?>(null)}
 val c=LocalContext.current
 val export=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/pdf")){uri->if(uri!=null)runCatching{Exports.pdf(c,uri,"${g.title} • Full wheel",lines.map{it.display()})}.onFailure{error=it.message}}
 val count=runCatching{choose(parseNumbers(pool).distinct().size,g.count)}.getOrDefault(0)
 Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
  Text("Full wheel & cost planner",style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold)
  Note("A full wheel creates every ${g.count}-number combination from your pool. It guarantees inclusion of the winning main line only IF all winning main numbers are in your pool.${if(g.specialMax>0)" The chosen PowerBall must also match for the jackpot." else ""} More lines cost more.")
  Field(pool,{pool=it;lines=emptyList()},"Pool of unique numbers")
  if(g.specialMax>0)Field(pb,{pb=it;lines=emptyList()},"One PowerBall • 1–16")
  Text("$count combinations • ${money(count*g.priceCents)} for this game",fontWeight=FontWeight.Bold)
  Text("Add-on prices exclude the required base entry. This is a line planner, not a ticket purchase or official Multi-Play submission.",style=MaterialTheme.typography.bodySmall)
  Button(onClick={runCatching{lines=Generator.wheel(g,parseNumbers(pool),pb.toIntOrNull());error=null}.onFailure{error=it.message}},modifier=Modifier.fillMaxWidth()){Text("Build full wheel")}
  error?.let{Note(it)}
  if(lines.isNotEmpty()){
   Text("${lines.size} lines created. Previewing ${minOf(20,lines.size)}.")
   lines.take(20).forEach{Text(it.display())}
   Button(onClick={vm.save(g,lines,today(),false)}){Text("Save wheel as favourites")}
   TextButton(onClick={export.launch("LottoLab-Full-Wheel.pdf")}){Text("Export all lines to PDF")}
  }
  Note("Abbreviated wheels and their conditional coverage guarantees are not enabled in this preview.")
 }
}

@Composable fun SyndicatePanel(groups:List<Syndicate>,vm:LottoViewModel){
 var name by rememberSaveable{mutableStateOf("")};var members by rememberSaveable{mutableStateOf("")};var refs by rememberSaveable{mutableStateOf("")};var pot by rememberSaveable{mutableStateOf("")};var error by remember{mutableStateOf<String?>(null)}
 Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
  Text("Keep your group organised",style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold)
  Note("Local record only. No funds are collected or sent. Members must agree on ownership and keep the original tickets.")
  Field(name,{name=it},"Syndicate name")
  Field(members,{members=it},"One member per row: Name, number of shares",false)
  Field(refs,{refs=it},"Ticket references / contribution notes",false)
  Field(pot,{pot=it},"Received prize pool in rand")
  Button(onClick={runCatching{require(name.isNotBlank());val parsed=parseMembers(members);require(parsed.isNotEmpty());val cents=java.math.BigDecimal(pot.ifBlank{"0"}).multiply(java.math.BigDecimal(100)).longValueExact();require(cents>=0);vm.saveSyndicate(Syndicate(name=name,members=members,ticketRefs=refs,potCents=cents));name="";members="";refs="";pot="";error=null}.onFailure{error="Enter members as Name, shares and a valid amount."}}){Text("Save syndicate record")}
  error?.let{Note(it)}
  groups.forEach{s->Panel{Text(s.name,style=MaterialTheme.typography.titleLarge);Text(s.ticketRefs);val ms=parseMembers(s.members);val total=ms.sumOf{it.second};var paid=0L;ms.forEachIndexed{i,m->val amount=if(i==ms.lastIndex)s.potCents-paid else (java.math.BigDecimal(s.potCents).multiply(java.math.BigDecimal(m.second)).divide(java.math.BigDecimal(total),0,java.math.RoundingMode.DOWN)).toLong();paid+=amount;Text("${m.first}: ${m.second} shares • ${money(amount)}")};Text("Rounding remainder assigned to the last member.",style=MaterialTheme.typography.bodySmall);TextButton(onClick={vm.deleteSyndicate(s)}){Text("Delete record")}}}
 }
}
fun parseMembers(s:String):List<Pair<String,Int>> = s.lines().filter{it.isNotBlank()}.map{val p=it.split(',');require(p.size==2 && p[0].trim().isNotEmpty());val n=p[1].trim().toInt();require(n in 1..10000);p[0].trim() to n}.also{require(it.size in 1..100)}

@Composable fun RulesPanel(){
 val c=LocalContext.current
 Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
  Text("Clear rules. Honest tools.",style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold)
  Note("Preview rule configuration: June 2026 changes are based on secondary sources. Official rulebook confirmation, exact effective draw IDs and cascade conditions remain release gates. This app is independent of the National Lottery.")
  Games.all.forEach{g->Panel{Text(g.title,fontWeight=FontWeight.Bold);Text("Choose ${g.count} from 1–${g.max}"+(if(g.specialMax>0)" + PowerBall 1–${g.specialMax}" else ""));Text("${money(g.priceCents.toLong())} per line • ${g.days}");Text("Jackpot odds: 1 in ${String.format(Locale.US,"%,d",jackpotOutcomes(g))}")}}
  Note("Plus 1, Lotto 5 Max and PowerBall XTRA are add-on games. Their displayed price does not include the required base-game entry. Always follow the operator's purchasing rules.")
  Panel{Text("Current and previous rules",fontWeight=FontWeight.Bold);Text("Statistics default to the June 2026 period. Older results stay in separate game and rule groups. Compare periods uses eligible draw counts, not pooled rankings.");Text("The connected feed currently lacks Lotto 5 Max and retired Daily Lotto Plus results. Pre-November 2015 PowerBall records are excluded until their historical rules are confirmed.")}
  Panel{Text("What statistics can tell you",fontWeight=FontWeight.Bold);Text("Frequency, gaps, pairs and patterns describe past results. They cannot identify future winning numbers in an independent fair draw. A long absence does not make a number due.")}
  Panel{Text("Claims and payouts",fontWeight=FontWeight.Bold);Text("Keep your original ticket. A photo, generated line or app match is not proof of purchase. Confirm results, eligibility and claim deadlines with the official operator. Missing payouts remain pending; cascades are not estimated.")}
  Panel{Text("Privacy and offline use",fontWeight=FontWeight.Bold);Text("Tickets, spending and syndicates are stored locally on this device. Photo text recognition runs on-device. No account or advertising tracker is included. Uninstalling clears local records; system backup is disabled in this preview. Use Backup & Export to keep a restorable copy.")}
  TextButton(onClick={c.startActivity(Intent(Intent.ACTION_VIEW,Uri.parse("https://www.nationallottery.co.za/")))}){Text("Official operator website ↗")}
  SourceLink()
  Text("18+ • Set a budget you can afford. LottoLab does not sell tickets or promise winnings.",style=MaterialTheme.typography.bodySmall,color=Muted)
 }
}

@Composable fun BackupPanel(tickets:List<Ticket>,groups:List<Syndicate>,vm:LottoViewModel){
 val c=LocalContext.current;val scope=rememberCoroutineScope()
 val save=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/json")){uri->if(uri!=null)scope.launch{runCatching{kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO){c.contentResolver.openOutputStream(uri)?.bufferedWriter()?.use{it.write(Backup.encode(tickets,groups,PresetStore.exportAll(c)))}?:error("Cannot write backup")};vm.message.value="Backup saved"}.onFailure{vm.message.value=it.message}}}
 val restore=rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()){uri->if(uri!=null)scope.launch{runCatching{val n=kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO){val json=c.contentResolver.openInputStream(uri)?.bufferedReader()?.use{reader->val buffer=CharArray(10000001);var total=0;while(total<buffer.size){val read=reader.read(buffer,total,buffer.size-total);if(read<0)break;total+=read};require(total<=10000000){"Backup too large"};String(buffer,0,total)}?:error("Cannot read backup");Backup.restore(c,json,tickets,groups)};vm.message.value="$n new records restored"}.onFailure{vm.message.value="Backup not imported: ${it.message}"}}}
 val pdf=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/pdf")){uri->if(uri!=null)runCatching{Exports.pdf(c,uri,"Saved ticket register",tickets.flatMap{listOf("${Games.get(it.game).title} | ${it.date} | ${if(it.purchased)"Purchased" else "Favourite"}",it.line().display(),"Cost ${money(it.costCents)} | Received ${it.receivedCents?.let(::money)?:"not recorded"}","")})}.onFailure{vm.message.value=it.message}}
 Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
  Text("Keep a copy of your records",style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold)
  Note("Backup v2 includes purchased and favourite tickets, spending, syndicate names and generator presets. It contains private information. Store it securely. Older LottoLab v1 backups are also supported. Restore adds missing records without overwriting saved IDs or presets.")
  Button(onClick={save.launch("LottoLab-Backup-${today()}.json")},modifier=Modifier.fillMaxWidth()){Text("Save restorable backup")}
  OutlinedButton(onClick={restore.launch(arrayOf("application/json","text/plain"))},modifier=Modifier.fillMaxWidth()){Text("Restore backup")}
  OutlinedButton(onClick={pdf.launch("LottoLab-Tickets-${today()}.pdf")},modifier=Modifier.fillMaxWidth()){Text("Export ticket register PDF")}
  Text("${tickets.size} ticket lines • ${groups.size} syndicates • ${PresetStore.exportAll(c).size} presets",color=Muted)
 }
}
