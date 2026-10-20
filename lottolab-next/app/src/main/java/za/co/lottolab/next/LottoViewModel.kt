package za.co.lottolab.next

import android.app.Application
import androidx.room.withTransaction
import androidx.lifecycle.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import za.co.lottolab.core.*
import java.time.LocalDate

class LottoViewModel(app:Application):AndroidViewModel(app){
 private val dao=Store.db(app).dao()
 val draws=dao.observeDraws().map{it.map(Store::draw)}.flowOn(Dispatchers.Default).stateIn(viewModelScope,SharingStarted.WhileSubscribed(5000),emptyList())
 val tickets=dao.observeTickets().stateIn(viewModelScope,SharingStarted.WhileSubscribed(5000),emptyList())
 val alerts=dao.observeAlerts().stateIn(viewModelScope,SharingStarted.WhileSubscribed(5000),emptyList())
 val syndicates=dao.observeSyndicates().stateIn(viewModelScope,SharingStarted.WhileSubscribed(5000),emptyList())
 val busy=MutableStateFlow(false)
 val message=MutableStateFlow<String?>(null)
 init{viewModelScope.launch{Sync.seed(app);refresh()}}
 fun refresh(){if(busy.value)return;viewModelScope.launch{busy.value=true;try{message.value=Sync.run(getApplication())}catch(e:Exception){message.value="Could not update. Saved results remain available. ${e.message}"}finally{busy.value=false}}}
 fun save(g:Game,lines:List<Line>,date:String,purchased:Boolean,note:String=""){viewModelScope.launch{
  runCatching{LocalDate.parse(date);lines.forEach{line->dao.putTicket(Ticket(game=g.id,date=date,numbers=line.numbers.joinToString(" "),special=line.special,purchased=purchased,costCents=if(purchased)g.priceCents.toLong() else 0,note=note))}}
   .onSuccess{message.value="${lines.size} ${if(purchased)"purchased ticket lines" else "favourites"} saved"}.onFailure{message.value=it.message}
 }}
 /**
  * Each draw gets its own saved ticket row. This preserves the v1 Room schema,
  * JSON backups and automatic match checks on subsequent result refreshes.
  */
 fun saveAcrossDraws(g:Game,lines:List<Line>,firstDate:String,drawCount:Int,purchased:Boolean) {
  viewModelScope.launch {
   try {
    require(lines.isNotEmpty() && lines.size<=20){"Enter between 1 and 20 lines"}
    val dates=DrawSchedule.nextDates(g.id,LocalDate.parse(firstDate),drawCount)
    lines.forEach{line->parseLines(line.display(),g)}
    val span=if(dates.size>1)"Multi-draw ${dates.first()} to ${dates.last()} (${dates.size} draws)" else ""
    val db=Store.db(getApplication())
    db.withTransaction {
     for((idx,date) in dates.withIndex())for(line in lines) {
      dao.putTicket(Ticket(
       game=g.id,date=date.toString(),numbers=line.numbers.joinToString(" "),
       special=line.special,purchased=purchased,
       costCents=if(purchased)g.priceCents.toLong() else 0L,
       note=if(dates.size>1)"$span • Draw ${idx+1}/${dates.size}" else ""
      ))
     }
    }
    val total=lines.size*dates.size
    message.value="$total saved ticket entries across ${dates.size} eligible draw${if(dates.size==1)"" else "s"}. Results will be checked as they arrive."
   }catch(e:Exception){ message.value=e.message?:"Could not save ticket" }
  }
 }
 fun delete(t:Ticket){viewModelScope.launch{dao.deleteTicket(t.id)}}
 fun received(t:Ticket,cents:Long){viewModelScope.launch{dao.putTicket(t.copy(receivedCents=cents));message.value="Received winnings recorded"}}
 fun saveSyndicate(s:Syndicate){viewModelScope.launch{dao.putSyndicate(s);message.value="Syndicate saved"}}
 fun deleteSyndicate(s:Syndicate){viewModelScope.launch{dao.deleteSyndicate(s.id)}}
}
