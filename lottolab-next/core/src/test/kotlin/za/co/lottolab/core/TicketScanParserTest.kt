package za.co.lottolab.core

import org.junit.Assert.*
import org.junit.Test

class TicketScanParserTest {
 @Test fun scansMultipleLottoBoardsButNotReceiptAmounts() {
  val input = """
    LOTTO
    Draw Date: 21/10/2026
    A 01 09 13 25 42 52
    B 02 12 15 26 37 49
    TOTAL R10.00
  """.trimIndent()
  val result = TicketScanParser.read(input, Games.get("lotto"))
  assertEquals(2, result.lines.size)
  assertEquals(listOf(1,9,13,25,42,52), result.lines[0].numbers)
  assertTrue(result.needsManualReview)
 }
 @Test fun scansPowerballSpecialWithoutGuessingPayout() {
  val input = "A: 05 12 23 31 50 PB 16"
  val result = TicketScanParser.read(input, Games.get("powerball"))
  assertEquals(1, result.lines.size)
  assertEquals(16, result.lines.single().special)
 }
 @Test fun ignoresInvalidLinesAndRetainsDuplicatesForManualReview() {
  val input = "01 02 03 04 05 58\n01 02 03 04 05 06\n01 02 03 04 05 06"
  val result = TicketScanParser.read(input, Games.get("lotto"))
  assertEquals(2, result.lines.size)
  assertEquals(1, result.skippedCandidates)
 }
 @Test fun rejectsMissingPowerballAndRepeatedMainNumbers() {
  assertTrue(TicketScanParser.read("01 02 03 04 05", Games.get("powerball")).lines.isEmpty())
  assertTrue(TicketScanParser.read("01 01 03 04 05 06", Games.get("lotto")).lines.isEmpty())
 }
}
