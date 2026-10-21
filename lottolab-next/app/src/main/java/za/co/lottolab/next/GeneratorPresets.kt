package za.co.lottolab.next

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.google.gson.reflect.TypeToken
import za.co.lottolab.core.*

data class GeneratorSettings(
 val count:String="5",
 val locked:String="",
 val excluded:String="",
 val odd:String="",
 val sumMin:String="",
 val sumMax:String="",
 val spread:String="",
 val noConsecutive:Boolean=false,
 val custom:Boolean=false
)
data class GeneratorPreset(val name:String,val gameId:String,val settings:GeneratorSettings)

object PresetStore {
 private const val KEY="generator_presets_v1"
 private const val MAX_PER_GAME=12
 private val listType=object:TypeToken<List<GeneratorPreset>>(){}.type
 private fun all(context:Context):List<GeneratorPreset> = runCatching {
  val json=context.getSharedPreferences("lottolab_presets",Context.MODE_PRIVATE).getString(KEY,"[]")?:"[]"
  val parsed:List<GeneratorPreset>?=Store.gson.fromJson(json,listType)
  (parsed?:emptyList()).take(100).filter{p->p.name.isNotBlank() && Games.all.any{it.id==p.gameId}}
 }.getOrDefault(emptyList())
 fun list(context:Context,gameId:String):List<GeneratorPreset> =
  all(context).filter{it.gameId==gameId}.sortedBy{it.name.lowercase()}
 /** Included in explicit user exports. Android private preferences remain offline. */
 fun exportAll(context:Context):List<GeneratorPreset> = all(context)
 /**
  * Validate a backup batch before any persisted change, then merge without
  * overwriting existing user presets. The caller should have already checked
  * the backup's schema and size.
  */
 fun mergeBackedUp(context:Context,incoming:List<GeneratorPreset>):Int {
  require(incoming.size<=72){"Too many presets in backup"}
  incoming.forEach { validate(it.name,Games.get(it.gameId),it.settings) }
  val existing=all(context)
  val merged=existing.toMutableList()
  var added=0
  for (preset in incoming) {
   if (merged.any{it.gameId==preset.gameId && it.name.equals(preset.name,ignoreCase=true)}) continue
   if (merged.count{it.gameId==preset.gameId}>=MAX_PER_GAME) continue
   merged+=preset
   added++
  }
  if(added>0)persist(context,merged)
  return added
 }
 fun validateBackedUp(incoming:List<GeneratorPreset>) {
  require(incoming.size<=72){"Too many presets in backup"}
  incoming.forEach{validate(it.name,Games.get(it.gameId),it.settings)}
 }
 private fun persist(context:Context,values:List<GeneratorPreset>) {
  val json=Store.gson.toJson(values)
  check(context.getSharedPreferences("lottolab_presets",Context.MODE_PRIVATE).edit().putString(KEY,json).commit()){"Unable to save preset"}
 }
 private fun validate(name:String,game:Game,settings:GeneratorSettings) {
  val title=name.trim()
  require(title.length in 1..40){"Enter a preset name between 1 and 40 characters"}
  require(title.none{it=='\n'||it=='\r'}){"Preset name must be one line"}
  val count=settings.count.toIntOrNull()
  require(count!=null && count in 1..100){"Choose 1–100 lines"}
  val locked=parseNumbers(settings.locked).toSet()
  val excluded=parseNumbers(settings.excluded).toSet()
  require(locked.size<=game.count && locked.all{it in 1..game.max} && excluded.all{it in 1..game.max}){"Invalid locked or excluded numbers"}
  require(locked.intersect(excluded).isEmpty()){"A number cannot be locked and excluded"}
  require(game.max-excluded.size>=game.count){"Too many exclusions"}
  if(settings.custom) {
   val odd=settings.odd.takeIf{it.isNotBlank()}?.toIntOrNull()
   val min=settings.sumMin.takeIf{it.isNotBlank()}?.toIntOrNull()
   val max=settings.sumMax.takeIf{it.isNotBlank()}?.toIntOrNull()
   val spread=settings.spread.takeIf{it.isNotBlank()}?.toIntOrNull()
   require(settings.odd.isBlank() || odd in 0..game.count){"Invalid odd count"}
   require(settings.sumMin.isBlank() || min!=null){"Invalid minimum sum"}
   require(settings.sumMax.isBlank() || max!=null){"Invalid maximum sum"}
   require(min==null || max==null || min<=max){"Minimum sum exceeds maximum"}
   require(settings.spread.isBlank() || (spread!=null && spread in 0..game.max-1)){"Invalid spread"}
  }
 }
 fun save(context:Context,game:Game,name:String,settings:GeneratorSettings) {
  validate(name,game,settings)
  val title=name.trim()
  val current=all(context)
  val remaining=current.filterNot{it.gameId==game.id && it.name.equals(title,ignoreCase=true)}
  require(remaining.count{it.gameId==game.id}<MAX_PER_GAME){"Maximum 12 presets per game"}
  persist(context,remaining+GeneratorPreset(title,game.id,settings))
 }
 fun delete(context:Context,gameId:String,name:String){
  persist(context,all(context).filterNot{it.gameId==gameId && it.name==name})
 }
}

/** Stores preferences, not predicted numbers and never purchases a ticket. */
@Composable
fun GeneratorPresetShelf(game:Game,snapshot:GeneratorSettings,onLoad:(GeneratorSettings)->Unit) {
 val context=androidx.compose.ui.platform.LocalContext.current
 var presetName by rememberSaveable(game.id){mutableStateOf("")}
 var version by remember(game.id){mutableIntStateOf(0)}
 var message by remember(game.id){mutableStateOf<String?>(null)}
 val saved=remember(game.id,version){PresetStore.list(context,game.id)}
 Panel {
  Text("My generator presets",fontWeight=FontWeight.Bold)
  Text("Save your favourite filters and reuse them without retyping.",style=MaterialTheme.typography.bodySmall,color=Muted)
  Field(presetName,{presetName=it},"Preset name • e.g. Favourite numbers")
  OutlinedButton(onClick={
   runCatching{PresetStore.save(context,game,presetName,snapshot)}
    .onSuccess{message="Preset saved for ${game.title}";presetName="";version++}
    .onFailure{message=it.message?:"Unable to save preset"}
  },enabled=presetName.isNotBlank(),modifier=Modifier.fillMaxWidth()){Text("Save current settings")}
  message?.let{Text(it,style=MaterialTheme.typography.bodySmall,color=Muted)}
  if(saved.isEmpty())Text("No saved presets for this game yet.",style=MaterialTheme.typography.bodySmall,color=Muted)
  saved.forEach{p->
   Row(horizontalArrangement=Arrangement.spacedBy(6.dp),modifier=Modifier.fillMaxWidth()){
    Text(p.name,modifier=Modifier.weight(1f).padding(top=12.dp),style=MaterialTheme.typography.bodyMedium)
    TextButton(onClick={onLoad(p.settings);message="Loaded ${p.name}"}){Text("Load")}
    TextButton(onClick={
     runCatching{PresetStore.delete(context,game.id,p.name)}.onSuccess{version++;message="Preset deleted"}.onFailure{message=it.message}
    }){Text("Delete")}
   }
  }
 }
}
