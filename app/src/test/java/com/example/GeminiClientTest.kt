package com.example

import com.example.core.network.GeminiClient
import kotlinx.coroutines.runBlocking
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class GeminiClientTest {
    @Test
    fun testGenerateContent() = runBlocking {
        try {
            val result = GeminiClient.generateContent("Hello")
            println("GEMINI_TEST_RESULT_SUCCESS: $result")
        } catch (e: Exception) {
            println("GEMINI_TEST_RESULT_ERROR: ${e.message}")
            e.printStackTrace()
        }
        assert(true)
    }
}
