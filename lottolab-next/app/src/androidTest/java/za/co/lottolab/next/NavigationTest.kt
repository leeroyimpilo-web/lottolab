package za.co.lottolab.next
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import org.junit.Rule
import org.junit.Test
class NavigationTest {
 @get:Rule val compose=createAndroidComposeRule<MainActivity>()
 @Test fun homeCheckerAndGenerator(){
  compose.onNodeWithText("Check Ticket").assertIsDisplayed().performClick()
  compose.onNodeWithText("Check your numbers").assertIsDisplayed()
  compose.onNodeWithContentDescription("Open menu").performClick()
  compose.onNodeWithText("Generate Numbers").performClick()
  compose.onNodeWithText("Make your next lines").assertIsDisplayed()
  compose.onNodeWithText("Generate numbers").performScrollTo().performClick()
  compose.waitUntil(10000){compose.onAllNodesWithText("LINE 1").fetchSemanticsNodes().isNotEmpty()}
  compose.onNodeWithText("LINE 1").performScrollTo().assertIsDisplayed()
 }
}
