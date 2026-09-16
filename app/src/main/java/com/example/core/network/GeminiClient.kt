package com.example.core.network

import com.example.BuildConfig
import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

@JsonClass(generateAdapter = true)
data class Part(
    @Json(name = "text") val text: String? = null
)

@JsonClass(generateAdapter = true)
data class Content(
    @Json(name = "parts") val parts: List<Part>
)

@JsonClass(generateAdapter = true)
data class ThinkingConfig(
    @Json(name = "thinkingLevel") val thinkingLevel: String // "low", "high", "off" etc.
)

@JsonClass(generateAdapter = true)
data class GenerationConfig(
    @Json(name = "temperature") val temperature: Float? = null,
    @Json(name = "thinkingConfig") val thinkingConfig: ThinkingConfig? = null
)

@JsonClass(generateAdapter = true)
data class GenerateContentRequest(
    @Json(name = "contents") val contents: List<Content>,
    @Json(name = "generationConfig") val generationConfig: GenerationConfig? = null,
    @Json(name = "systemInstruction") val systemInstruction: Content? = null
)

@JsonClass(generateAdapter = true)
data class Candidate(
    @Json(name = "content") val content: Content
)

@JsonClass(generateAdapter = true)
data class GenerateContentResponse(
    @Json(name = "candidates") val candidates: List<Candidate>? = null
)

interface GeminiApiService {
    @POST("v1beta/models/{model}:generateContent")
    suspend fun generateContent(
        @Path("model") model: String,
        @Query("key") apiKey: String,
        @Body request: GenerateContentRequest
    ): GenerateContentResponse
}

object GeminiClient {
    private const val BASE_URL = "https://generativelanguage.googleapis.com/"

    private val moshi = Moshi.Builder()
        .addLast(KotlinJsonAdapterFactory())
        .build()

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(90, TimeUnit.SECONDS)
        .readTimeout(90, TimeUnit.SECONDS)
        .writeTimeout(90, TimeUnit.SECONDS)
        .addInterceptor(loggingInterceptor)
        .build()

    val service: GeminiApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
            .create(GeminiApiService::class.java)
    }

    suspend fun generateContent(
        prompt: String,
        model: String = "gemini-2.5-flash",
        systemInstruction: String? = null,
        enableHighThinking: Boolean = false
    ): String {
        val apiKey = BuildConfig.GEMINI_API_KEY
        if (apiKey.isEmpty() || apiKey == "MY_GEMINI_API_KEY") {
            return "API Key is not configured. Please add your GEMINI_API_KEY to your AI Studio Secrets panel."
        }

        val requestBody = GenerateContentRequest(
            contents = listOf(
                Content(parts = listOf(Part(text = prompt)))
            ),
            generationConfig = if (enableHighThinking) {
                // High thinking config, do not set maxOutputTokens
                GenerationConfig(
                    thinkingConfig = ThinkingConfig(thinkingLevel = "high")
                )
            } else {
                GenerationConfig(temperature = 0.2f)
            },
            systemInstruction = systemInstruction?.let {
                Content(parts = listOf(Part(text = it)))
            }
        )

        // Try primary model, fallback if HTTP 503 (high demand) or 404
        val candidateModels = if (model != "gemini-2.5-flash") {
            listOf(model, "gemini-2.5-flash", "gemini-3.5-flash")
        } else {
            listOf("gemini-2.5-flash", "gemini-3.5-flash")
        }

        var lastError = ""
        for (targetModel in candidateModels) {
            try {
                val response = service.generateContent(targetModel, apiKey, requestBody)
                val text = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
                if (!text.isNullOrBlank()) {
                    return text
                }
            } catch (e: retrofit2.HttpException) {
                val code = e.code()
                val errorBody = e.response()?.errorBody()?.string() ?: ""
                val errorMessage = if (errorBody.contains("\"message\"")) {
                    Regex("\"message\"\\s*:\\s*\"([^\"]+)\"").find(errorBody)?.groupValues?.get(1) ?: errorBody
                } else {
                    errorBody
                }
                lastError = "Network Error: HTTP $code - $errorMessage"
                // If 503 or 429 or 404, try next candidate model
                if (code == 503 || code == 429 || code == 404) {
                    continue
                } else {
                    return lastError
                }
            } catch (e: java.net.UnknownHostException) {
                return "Network Error: No internet connection. The emulator might be offline."
            } catch (e: Exception) {
                lastError = "Network Error: ${e.javaClass.simpleName} - ${e.localizedMessage}"
            }
        }

        return if (lastError.isNotEmpty()) lastError else "No response content found."
    }
}
