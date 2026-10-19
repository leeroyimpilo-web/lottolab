package za.co.lottolab.core

/** Conservative on-device OCR pre-parser. Never treats text extraction as ticket validation. */
data class TicketScan(val lines: List<Line>, val skippedCandidates: Int, val needsManualReview: Boolean = true)

object TicketScanParser {
 private val digits = Regex("""(?<!\d)\d{1,2}(?!\d)""")
 private val skipHeaders = Regex("""\b(?:DRAW\s*DATE|DATE|TICKET\s*(?:NO|NUMBER)|RECEIPT|SERIAL|JACKPOT|TOTAL|AMOUNT|COST|PRICE|BALANCE|ACCOUNT|REF(?:ERENCE)?)\b""", RegexOption.IGNORE_CASE)
 /**
  * Parse only complete number rows, retaining duplicates (two identical purchased
  * boards must not be quietly removed). No lines are saved without user confirmation.
  */
 fun read(text: String, game: Game): TicketScan {
  val result = mutableListOf<Line>()
  var skipped = 0
  val expected = game.count + (if (game.specialMax > 0) 1 else 0)
  for (raw in text.lineSequence()) {
   if (result.size >= 20) break
   val row = raw.trim()
   if (row.isEmpty() || skipHeaders.containsMatchIn(row) || Regex("""\d{3,}""").containsMatchIn(row)) continue
   val numbers = digits.findAll(row).map { it.value.toInt() }.toList()
   // Only rows containing exactly one complete entry can be pre-filled.
   if (numbers.size != expected) {
    if (numbers.size >= game.count) skipped++
    continue
   }
   val main = numbers.take(game.count)
   val extra = if (game.specialMax > 0) numbers.last() else null
   if (main.distinct().size != game.count || main.any { it !in 1..game.max } || (extra != null && extra !in 1..game.specialMax)) {
    skipped++
    continue
   }
   result += Line(main.sorted(), extra)
  }
  return TicketScan(result, skipped)
 }
}
