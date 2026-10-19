package za.co.lottolab.next

import android.Manifest
import android.app.*
import android.content.*
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.work.*
import java.util.concurrent.TimeUnit

class LottoApp:Application(){override fun onCreate(){super.onCreate()
 val work=PeriodicWorkRequestBuilder<SyncWorker>(6,TimeUnit.HOURS).setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).setBackoffCriteria(BackoffPolicy.EXPONENTIAL,30,TimeUnit.SECONDS).build()
 WorkManager.getInstance(this).enqueueUniquePeriodicWork("draw-sync",ExistingPeriodicWorkPolicy.KEEP,work)
}}
class SyncWorker(context:Context,params:WorkerParameters):CoroutineWorker(context,params){override suspend fun doWork():Result=try{Sync.run(applicationContext);Result.success()}catch(e:Exception){if(runAttemptCount<3)Result.retry() else Result.failure()}}
object Notifications {
 fun show(c:Context,title:String,body:String){
  if(Build.VERSION.SDK_INT>=33 && ContextCompat.checkSelfPermission(c,Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)return
  val manager=c.getSystemService(NotificationManager::class.java)
  manager.createNotificationChannel(NotificationChannel("results","Lottery result updates",NotificationManager.IMPORTANCE_DEFAULT))
  val pending=PendingIntent.getActivity(c,0,Intent(c,MainActivity::class.java),PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
  manager.notify(1,NotificationCompat.Builder(c,"results").setSmallIcon(za.co.lottolab.next.R.drawable.ic_lottolab).setContentTitle(title).setContentText(body).setContentIntent(pending).setAutoCancel(true).build())
 }
}
