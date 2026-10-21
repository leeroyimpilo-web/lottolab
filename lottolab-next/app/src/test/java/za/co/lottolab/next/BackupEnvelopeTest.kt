package za.co.lottolab.next

import com.google.gson.Gson
import org.junit.Assert.*
import org.junit.Test

class BackupEnvelopeTest {
 private val gson=Gson()
 @Test fun exportsPresetSettingsInV2Envelope() {
  val p=GeneratorPreset("Family Picks","lotto",GeneratorSettings(count="6",locked="1,5",excluded="9"))
  val json=gson.toJson(BackupBundle(tickets=emptyList(),syndicates=emptyList(),presets=listOf(p)))
  val copy=gson.fromJson(json,BackupBundle::class.java)
  assertEquals(2,copy.schema)
  assertEquals("Family Picks",copy.presets!!.single().name)
  assertEquals("1,5",copy.presets!!.single().settings.locked)
 }
 @Test fun legacyV1WithoutPresetsCanStillBeParsed() {
  val v1="""{"schema":1,"exportedAt":"2026-10-01T00:00:00Z","tickets":[],"syndicates":[]}"""
  val copy=gson.fromJson(v1,BackupBundle::class.java)
  assertEquals(1,copy.schema)
  assertTrue(copy.tickets.isEmpty())
  assertTrue(copy.presets.orEmpty().isEmpty())
 }
 @Test fun presetsRejectOutOfRangeLockedNumber() {
  try{
   PresetStore.validateBackedUp(listOf(GeneratorPreset("Invalid","lotto",GeneratorSettings(locked="60"))))
   fail("Expected invalid number to be rejected")
  }catch(e:IllegalArgumentException){assertTrue(e.message!!.isNotBlank())}
 }
}
