package za.co.lottolab.next

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import za.co.lottolab.core.Game
import za.co.lottolab.core.Line

/**
 * Easier alternative to typing long comma-separated ticket numbers.
 * Builds a complete line in memory, but never marks it as purchased.
 */
@Composable
fun TicketNumberPad(game: Game, onAddLine: (Line) -> Unit) {
 var expanded by rememberSaveable(game.id) { mutableStateOf(false) }
 val numbers = remember(game.id) { mutableStateListOf<Int>() }
 var powerBall by remember(game.id) { mutableStateOf<Int?>(null) }

 OutlinedButton(onClick = { expanded = !expanded }, modifier = Modifier.fillMaxWidth()) {
  Text(if (expanded) "Hide number pad" else "Choose numbers by tapping")
 }
 if (!expanded) return

 Card(colors = CardDefaults.cardColors(containerColor = Color(0xFFF4F7F5)),
  shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
  Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
   Text("Main numbers • ${numbers.size} of ${game.count}", fontWeight = FontWeight.Bold)
   Text("Tap a number to select or remove it.", style = MaterialTheme.typography.bodySmall)
   TicketNumberGrid(game.max, numbers.toSet()) { value ->
    if (value in numbers) numbers.remove(value)
    else if (numbers.size < game.count) numbers.add(value)
   }
   if (game.specialMax > 0) {
    Text("PowerBall • choose one", fontWeight = FontWeight.Bold)
    TicketNumberGrid(game.specialMax, powerBall?.let { setOf(it) } ?: emptySet()) { value ->
     powerBall = if (powerBall == value) null else value
    }
   }
   val complete = numbers.size == game.count && (game.specialMax == 0 || powerBall != null)
   Button(
    onClick = {
     onAddLine(Line(numbers.sorted(), powerBall))
     numbers.clear()
     powerBall = null
    },
    enabled = complete,
    modifier = Modifier.fillMaxWidth()
   ) { Text("Add this line to ticket") }
   Text("Review your lines and draw date before checking or saving. This does not buy a ticket.",
    style = MaterialTheme.typography.bodySmall)
  }
 }
}

@Composable
fun TicketNumberGrid(max: Int, selected: Set<Int>, onTap: (Int) -> Unit) {
 Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
  (1..max).toList().chunked(7).forEach { row ->
   Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
    row.forEach { n ->
     val picked = n in selected
     Surface(
      onClick = { onTap(n) },
      modifier = Modifier.weight(1f).height(39.dp),
      shape = RoundedCornerShape(9.dp),
      color = if (picked) Green else Color.White,
      contentColor = if (picked) Color.White else Ink,
      border = if (picked) null else BorderStroke(1.dp, Color(0xFFCDD9D2))
     ) {
      Box(contentAlignment = Alignment.Center) {
       Text(n.toString().padStart(2, '0'), style = MaterialTheme.typography.labelMedium)
      }
     }
    }
    repeat(7 - row.size) { Spacer(Modifier.weight(1f)) }
   }
  }
 }
}
