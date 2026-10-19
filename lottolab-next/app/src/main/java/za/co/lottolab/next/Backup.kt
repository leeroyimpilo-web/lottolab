package za.co.lottolab.next
import android.content.Context
import androidx.room.withTransaction
import za.co.lottolab.core.*
import java.time.*

data class BackupBundle(val schema:Int=1,val exportedAt:String=Instant.now().toString(),val tickets:List<Ticket>,val syndicates:List<Syndicate>)
object Backup {
 fun encode(t:List<Ticket>,s:List<Syndicate>)=Store.gson.toJson(BackupBundle(tickets=t,syndicates=s))
 suspend fun restore(c:Context,json:String,existingTickets:List<Ticket>,existingGroups:List<Syndicate>):Int {
  require(json.length<=10_000_000){"Backup too large"}
  val b=Store.gson.fromJson(json,BackupBundle::class.java)
  require(b.schema==1 && b.tickets.size<=20000 && b.syndicates.size<=1000){"Unsupported backup"}
  b.tickets.forEach{t->
   require(t.id.isNotBlank() && t.id.length<=100 && t.note.length<=10000)
   val g=Games.get(t.game);val date=LocalDate.parse(t.date);require(date>=Rules.cutover)
   parseLines(t.line().display(),g)
   require(t.costCents>=0 && (t.receivedCents==null || t.receivedCents>=0))
   require(t.purchased || t.costCents==0L && t.receivedCents==null){"Favourite contains financial records"}
  }
  b.syndicates.forEach{require(it.id.isNotBlank() && it.name.isNotBlank() && it.name.length<=300 && it.ticketRefs.length<=10000 && it.potCents>=0);parseMembers(it.members)}
  val tickets=b.tickets.distinctBy{it.id}.filter{t->existingTickets.none{it.id==t.id}}
  val groups=b.syndicates.distinctBy{it.id}.filter{s->existingGroups.none{it.id==s.id}}
  val db=Store.db(c)
  db.withTransaction{tickets.forEach{db.dao().putTicket(it)};groups.forEach{db.dao().putSyndicate(it)}}
  return tickets.size+groups.size
 }
}
