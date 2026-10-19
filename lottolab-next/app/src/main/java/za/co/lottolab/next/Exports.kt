package za.co.lottolab.next

import android.content.Context
import android.content.Intent
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.net.Uri

object Exports {
 fun share(c:Context,text:String) {
  c.startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT,text),"Share LottoLab numbers").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
 }

 fun pdf(c:Context,uri:Uri,title:String,lines:List<String>) {
  val doc=PdfDocument()
  try {
   val pages=(listOf("LottoLab Next",title,"Research and planning • Not proof of purchase","")+lines).chunked(43)
   pages.forEachIndexed { i,rows->
    val page=doc.startPage(PdfDocument.PageInfo.Builder(595,842,i+1).create())
    val p=Paint().apply { textSize=11f; color=android.graphics.Color.rgb(24,45,42) }
    rows.forEachIndexed { n,s->page.canvas.drawText(s.take(88),36f,42f+n*17,p) }
    doc.finishPage(page)
   }
   val output=c.contentResolver.openOutputStream(uri) ?: error("Could not open the selected document")
   output.use { doc.writeTo(it) }
  } finally {
   doc.close()
  }
 }
}
