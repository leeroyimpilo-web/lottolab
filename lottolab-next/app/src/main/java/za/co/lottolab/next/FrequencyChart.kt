package za.co.lottolab.next

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import za.co.lottolab.core.*
import java.util.Locale

/** Two clearly labelled bars per number: observed record count versus expected average. */
@Composable
fun FrequencyChart(game:Game,stats:List<NumberStat>,sampleSize:Int,drawBalls:Int,ballMaximum:Int) {
 val model=remember(sampleSize,drawBalls,ballMaximum){
  StatsBenchmark.appearance(sampleSize,drawBalls,ballMaximum)
 }
 var page by remember(game.id,ballMaximum,sampleSize){mutableIntStateOf(0)}
 val count=12
 val maxPage=(ballMaximum-1)/count
 Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
  Text("Frequency chart",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)
  Note("Observed bars describe the downloaded archive, not the next draw. Each number has the same chance in a fair draw.")
  if(sampleSize==0){Note("No loaded results. A missing archive does not count as zero appearances.");return@Column}
  Panel{
   Text("$sampleSize draws • $drawBalls from 1–$ballMaximum",fontWeight=FontWeight.Bold)
   Text("Expected appearances per number: ${fmt(model.expected)}")
   Text("Approximate 95% random-variation interval: ${fmt(model.lowerApprox)}–${fmt(model.upperApprox)}",style=MaterialTheme.typography.bodySmall,color=Muted)
   Text("Interval uses a binomial approximation for one number. It is not a certainty or prediction, and simultaneous comparisons can show apparent outliers by chance.",style=MaterialTheme.typography.bodySmall,color=Muted)
  }
  Row(horizontalArrangement=Arrangement.spacedBy(10.dp)){
   OutlinedButton(onClick={page=(page-1).coerceAtLeast(0)},enabled=page>0){Text("Previous")}
   Text("Numbers ${page*count+1}–${minOf((page+1)*count,ballMaximum)}",modifier=Modifier.weight(1f).padding(top=12.dp),style=MaterialTheme.typography.bodySmall)
   OutlinedButton(onClick={page=(page+1).coerceAtMost(maxPage)},enabled=page<maxPage){Text("Next")}
  }
  Panel{
   Row(horizontalArrangement=Arrangement.spacedBy(12.dp)){
    Text("Observed",color=Color(game.color),fontWeight=FontWeight.SemiBold)
    Text("Expected average",color=Muted)
   }
   stats.filter{it.number in page*count+1..minOf((page+1)*count,ballMaximum)}
    .sortedBy{it.number}.forEach{s->
     Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){
      Text(s.number.toString().padStart(2,'0'),modifier=Modifier.width(29.dp),fontWeight=FontWeight.Bold)
      Column(modifier=Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(3.dp)){
       LinearProgressIndicator(progress={(s.hits.toFloat()/sampleSize).coerceIn(0f,1f)},modifier=Modifier.fillMaxWidth(),color=Color(game.color),trackColor=Color(0xFFE8EEE9))
       LinearProgressIndicator(progress={(model.expected/sampleSize).toFloat().coerceIn(0f,1f)},modifier=Modifier.fillMaxWidth(),color=Color(0xFF9AA8A1),trackColor=Color(0xFFE8EEE9))
      }
      Text("${s.hits}",modifier=Modifier.width(32.dp),style=MaterialTheme.typography.bodySmall)
     }
    }
  }
  Text("The bar scale represents share of eligible draws. Use Compare Two Numbers for dates and pair history.",color=Muted,style=MaterialTheme.typography.bodySmall)
 }
}
private fun fmt(value:Double)=String.format(Locale.US,"%.1f",value)
