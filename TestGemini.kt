import java.net.HttpURLConnection
import java.net.URL
import java.io.OutputStreamWriter

fun main() {
    val apiKey = "AQ.Ab8RN6LDmsHv1bFLHXlvSC_02ifN8JSZfr2tNELHd-Vamss8Sg"
    val model = "gemini-3.5-flash"
    val url = URL("https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey")
    val conn = url.openConnection() as HttpURLConnection
    conn.requestMethod = "POST"
    conn.setRequestProperty("Content-Type", "application/json")
    conn.doOutput = true

    val body = """{"contents":[{"parts":[{"text":"Hello"}]}]}"""
    OutputStreamWriter(conn.outputStream).use { it.write(body) }

    println("Response Code: ${conn.responseCode}")
    if (conn.responseCode == 200) {
        println(conn.inputStream.bufferedReader().readText())
    } else {
        println(conn.errorStream.bufferedReader().readText())
    }
}
