package za.co.lottolab.next

import android.content.Context
import androidx.room.*
import com.google.gson.Gson
import kotlinx.coroutines.flow.Flow
import za.co.lottolab.core.*

@Entity(tableName="draws", indices=[Index(value=["game","date"],unique=true)])
data class DrawRow(@PrimaryKey val id:String,val game:String,val date:String,val ruleId:String,val json:String)
@Entity(tableName="tickets")
data class Ticket(@PrimaryKey val id:String=java.util.UUID.randomUUID().toString(),val game:String,val date:String,val numbers:String,val special:Int?,val purchased:Boolean=false,val costCents:Long=0,val receivedCents:Long?=null,val note:String="") { fun line()=Line(parseNumbers(numbers),special) }
@Entity(tableName="revisions")
data class Revision(@PrimaryKey(autoGenerate=true) val id:Long=0,val drawId:String,val oldJson:String,val changedAt:String)
@Entity(tableName="alerts")
data class Alert(@PrimaryKey val id:String,val title:String,val body:String,val createdAt:String=java.time.Instant.now().toString())
@Entity(tableName="syndicates")
data class Syndicate(@PrimaryKey val id:String=java.util.UUID.randomUUID().toString(),val name:String,val members:String,val ticketRefs:String,val potCents:Long=0)
@Dao interface LottoDao {
 @Query("SELECT * FROM draws ORDER BY date DESC") fun observeDraws():Flow<List<DrawRow>>
 @Query("SELECT * FROM draws") suspend fun draws():List<DrawRow>
 @Insert(onConflict=OnConflictStrategy.REPLACE) suspend fun putDraws(rows:List<DrawRow>)
 @Query("SELECT * FROM tickets ORDER BY date DESC") fun observeTickets():Flow<List<Ticket>>
 @Insert(onConflict=OnConflictStrategy.REPLACE) suspend fun putTicket(ticket:Ticket)
 @Query("DELETE FROM tickets WHERE id=:id") suspend fun deleteTicket(id:String)
 @Insert suspend fun revision(row:Revision)
 @Insert(onConflict=OnConflictStrategy.IGNORE) suspend fun alert(row:Alert)
 @Query("SELECT * FROM alerts ORDER BY createdAt DESC LIMIT 100") fun observeAlerts():Flow<List<Alert>>
 @Query("SELECT * FROM syndicates ORDER BY name") fun observeSyndicates():Flow<List<Syndicate>>
 @Insert(onConflict=OnConflictStrategy.REPLACE) suspend fun putSyndicate(row:Syndicate)
 @Query("DELETE FROM syndicates WHERE id=:id") suspend fun deleteSyndicate(id:String)
}
@Database(entities=[DrawRow::class,Ticket::class,Revision::class,Alert::class,Syndicate::class],version=1,exportSchema=true)
abstract class LottoDb:RoomDatabase(){abstract fun dao():LottoDao}
object Store {
 val gson=Gson()
 @Volatile private var instance:LottoDb?=null
 fun db(context:Context):LottoDb=instance?:synchronized(this){instance?:Room.databaseBuilder(context.applicationContext,LottoDb::class.java,"lottolab-next.db").build().also{instance=it}}
 fun row(d:Draw)=DrawRow(d.id,d.game,d.date,d.ruleId,gson.toJson(d))
 fun draw(r:DrawRow):Draw=gson.fromJson(r.json,Draw::class.java)
}
