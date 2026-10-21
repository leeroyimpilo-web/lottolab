package za.co.lottolab.next

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

/** Short, offline-first tutorial. No account, internet, or permissions required. */
@Composable
fun GuidePanel() {
 val chapters=listOf(
  "Start here" to "Home displays stored results for each game. Tap Update to request newer provider data when online. Offline, the latest cached results remain available. Use Results & Sources to check coverage gaps.",
  "Check a ticket" to "Select Check Ticket, choose a game and eligible draw date, then tap the number grid or scan a photo. Always check extracted lines against the original paper ticket before saving. A match in this app cannot validate ticket authenticity.",
  "Several draws" to "Set the first eligible date and the number of consecutive draws (1–10). LottoLab lists the actual scheduled dates, estimates the recorded cost and saves a separate local entry for each draw.",
  "My Tickets" to "Purchased tickets are kept separately from favourites. Filters show upcoming draws, results not yet loaded, payout details needing review and possible published payouts. Recorded winnings mean money you actually received, not estimated winnings.",
  "Generate numbers" to "Choose how many lines to generate. Lock or exclude numbers, and optionally set filters. Save your preferences as a named preset. Every valid combination keeps the same jackpot probability; filters cannot predict draws.",
  "Research your numbers" to "Explore Numbers shows frequencies, gaps, pairs and charts. Compare Two Numbers shows expected average occurrences. Combination Explorer finds matches in the currently downloaded history. Older rule periods remain separate.",
  "Find repeat lines" to "Ticket Portfolio shows repeated entries for the same game and draw date. Playing the same numbers on a different date is not a duplicate in this report. Identical paid tickets may still be intentional purchases.",
  "Export your records" to "Use Backup & Export to create a JSON backup containing tickets, group records and presets. CSV and PDF reports are available in research screens. Store backups privately; some contain personal and financial details.",
  "What if data is missing?" to "An absent result, Lotto 5 Max record, or prize breakdown is marked unavailable. Do not assume your ticket has lost. Check the lottery operator directly for results and prize claiming requirements.",
  "Play responsibly" to "LottoLab does not sell tickets, promise wins or provide number predictions. Choose a budget before playing and do not chase losses. Players should meet their local legal age requirements."
 )
 var expanded by rememberSaveable{mutableStateOf("Start here")}
 Column(verticalArrangement=Arrangement.spacedBy(12.dp)) {
  Text("LottoLab User Guide",style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold)
  Note("A plain-language guide to the tools. All instructions are available offline.")
  chapters.forEach{(title,body)->
   OutlinedCard(onClick={expanded=if(expanded==title)"" else title},modifier=Modifier.fillMaxWidth()) {
    Column(Modifier.padding(14.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
     Row(modifier=Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.SpaceBetween) {
      Text(title,modifier=Modifier.weight(1f),fontWeight=FontWeight.SemiBold)
      Text(if(expanded==title)"−" else "+",color=Muted)
     }
     if(expanded==title) Text(body,style=MaterialTheme.typography.bodyMedium)
    }
   }
  }
  Text("Independent research companion • 18+ • Results and payouts require operator confirmation.",style=MaterialTheme.typography.bodySmall,color=Muted)
 }
}
