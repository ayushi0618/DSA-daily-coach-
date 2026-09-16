package com.example.features.providers

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.core.database.RevisionEntity
import com.example.core.database.SearchHistoryEntity
import com.example.core.database.SolvedProblemEntity
import com.example.core.database.UserEntity
import com.example.core.network.Content
import com.example.core.network.Part
import com.example.core.repository.SolvedProblemRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

sealed interface SolutionState {
    object Idle : SolutionState
    object Loading : SolutionState
    data class Success(val response: String, val problemId: String, val language: String) : SolutionState
    data class Error(val message: String) : SolutionState
}

data class ChatMessage(val text: String, val isUser: Boolean, val timestamp: Long = System.currentTimeMillis())

class DsaViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = SolvedProblemRepository(application)

    init {
        viewModelScope.launch {
            repository.ensureUserExists()
        }
    }

    private val sharedPrefs = application.getSharedPreferences("dsa_daily_coach_prefs", Context.MODE_PRIVATE)

    // --- Auth State ---
    private val _isAuthenticated = MutableStateFlow(sharedPrefs.getBoolean("is_authenticated", true))
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()

    private val _isAuthLoading = MutableStateFlow(false)
    val isAuthLoading: StateFlow<Boolean> = _isAuthLoading.asStateFlow()

    private val _authError = MutableStateFlow<String?>(null)
    val authError: StateFlow<String?> = _authError.asStateFlow()

    fun signIn(email: String, pass: String, onSuccess: () -> Unit = {}) {
        if (email.isBlank() || pass.isBlank()) {
            _authError.value = "Please enter both email and password."
            return
        }
        viewModelScope.launch {
            _isAuthLoading.value = true
            _authError.value = null
            val res = repository.signInWithEmail(email, pass)
            _isAuthLoading.value = false
            if (res.isSuccess) {
                sharedPrefs.edit().putBoolean("is_authenticated", true).apply()
                _isAuthenticated.value = true
                onSuccess()
            } else {
                _authError.value = res.exceptionOrNull()?.message ?: "Sign in failed"
            }
        }
    }

    fun signUp(name: String, email: String, pass: String, lang: String, goal: Int, onSuccess: () -> Unit = {}) {
        if (email.isBlank() || pass.isBlank()) {
            _authError.value = "Please fill in all required fields."
            return
        }
        viewModelScope.launch {
            _isAuthLoading.value = true
            _authError.value = null
            val res = repository.signUpWithEmail(name, email, pass, lang, goal)
            _isAuthLoading.value = false
            if (res.isSuccess) {
                sharedPrefs.edit().putBoolean("is_authenticated", true).apply()
                _isAuthenticated.value = true
                onSuccess()
            } else {
                _authError.value = res.exceptionOrNull()?.message ?: "Sign up failed"
            }
        }
    }

    fun signInAsGuest(onSuccess: () -> Unit = {}) {
        viewModelScope.launch {
            _isAuthLoading.value = true
            val res = repository.signInAsGuest()
            _isAuthLoading.value = false
            if (res.isSuccess) {
                sharedPrefs.edit().putBoolean("is_authenticated", true).apply()
                _isAuthenticated.value = true
                onSuccess()
            }
        }
    }

    fun signOut() {
        viewModelScope.launch {
            repository.signOutUser()
            sharedPrefs.edit().putBoolean("is_authenticated", false).apply()
            _isAuthenticated.value = false
        }
    }

    fun clearAuthError() {
        _authError.value = null
    }

    // --- User State ---
    val userState: StateFlow<UserEntity?> = repository.getActiveUserFlow()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )

    // --- Solved Problems ---
    val solvedProblems: StateFlow<List<SolvedProblemEntity>> = repository.getAllSolvedProblems()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // --- Bookmarked / Favorite Problems ---
    val bookmarkedProblems: StateFlow<List<SolvedProblemEntity>> = repository.getBookmarkedProblems()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // --- Search History ---
    val searchHistory: StateFlow<List<SearchHistoryEntity>> = repository.getSearchHistory()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // --- Revision Log ---
    val revisionLogs: StateFlow<List<RevisionEntity>> = repository.getAllRevisions()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // --- Solution Generation State ---
    private val _solutionState = MutableStateFlow<SolutionState>(SolutionState.Idle)
    val solutionState: StateFlow<SolutionState> = _solutionState.asStateFlow()

    // --- Chat Messages State ---
    private val _chatMessages = MutableStateFlow<List<ChatMessage>>(
        listOf(
            ChatMessage("Hello! I am your DSA Daily Coach AI Assistant. Ask me any Data Structures or Algorithms doubts!", false)
        )
    )
    val chatMessages: StateFlow<List<ChatMessage>> = _chatMessages.asStateFlow()

    private val _isChatLoading = MutableStateFlow(false)
    val isChatLoading: StateFlow<Boolean> = _isChatLoading.asStateFlow()

    private val _isSocraticMode = MutableStateFlow(false)
    val isSocraticMode: StateFlow<Boolean> = _isSocraticMode.asStateFlow()

    fun toggleSocraticMode(enabled: Boolean) {
        _isSocraticMode.value = enabled
    }

    // --- Theme / Preference State ---
    private val _isDarkMode = MutableStateFlow(true) // Default to beautiful premium dark theme
    val isDarkMode: StateFlow<Boolean> = _isDarkMode.asStateFlow()

    private val _isNotificationEnabled = MutableStateFlow(true)
    val isNotificationEnabled: StateFlow<Boolean> = _isNotificationEnabled.asStateFlow()

    private val _dailyReminderTime = MutableStateFlow("20:00")
    val dailyReminderTime: StateFlow<String> = _dailyReminderTime.asStateFlow()

    private val _preferredLanguage = MutableStateFlow("Java")
    val preferredLanguage: StateFlow<String> = _preferredLanguage.asStateFlow()

    // --- Onboarding State ---
    private val _hasCompletedOnboarding = MutableStateFlow(sharedPrefs.getBoolean("has_completed_onboarding", false))
    val hasCompletedOnboarding: StateFlow<Boolean> = _hasCompletedOnboarding.asStateFlow()

    fun completeOnboarding() {
        sharedPrefs.edit().putBoolean("has_completed_onboarding", true).apply()
        _hasCompletedOnboarding.value = true
    }

    fun resetOnboarding() {
        sharedPrefs.edit().putBoolean("has_completed_onboarding", false).apply()
        _hasCompletedOnboarding.value = false
    }

    // --- Gamification Chat Counter ---
    private val _chatQuestionsCount = MutableStateFlow(sharedPrefs.getInt("chat_questions_count", 0))
    val chatQuestionsCount: StateFlow<Int> = _chatQuestionsCount.asStateFlow()

    private val _leetcodeUsername = MutableStateFlow(sharedPrefs.getString("leetcode_username", "") ?: "")
    val leetcodeUsername: StateFlow<String> = _leetcodeUsername.asStateFlow()

    private val _isLeetCodeLinked = MutableStateFlow(sharedPrefs.getBoolean("leetcode_linked", false))
    val isLeetCodeLinked: StateFlow<Boolean> = _isLeetCodeLinked.asStateFlow()

    private val _autoSubmitToLeetCode = MutableStateFlow(sharedPrefs.getBoolean("leetcode_autosubmit", false))
    val autoSubmitToLeetCode: StateFlow<Boolean> = _autoSubmitToLeetCode.asStateFlow()

    fun linkLeetCodeAccount(username: String) {
        sharedPrefs.edit()
            .putString("leetcode_username", username)
            .putBoolean("leetcode_linked", true)
            .apply()
        _leetcodeUsername.value = username
        _isLeetCodeLinked.value = true
    }

    fun unlinkLeetCodeAccount() {
        sharedPrefs.edit()
            .remove("leetcode_username")
            .putBoolean("leetcode_linked", false)
            .apply()
        _leetcodeUsername.value = ""
        _isLeetCodeLinked.value = false
    }

    fun toggleAutoSubmitLeetCode() {
        val newVal = !_autoSubmitToLeetCode.value
        sharedPrefs.edit().putBoolean("leetcode_autosubmit", newVal).apply()
        _autoSubmitToLeetCode.value = newVal
    }

    // --- Profile Editing State ---
    fun updateProfile(name: String, email: String, dailyGoal: Int, preferredLang: String) {
        viewModelScope.launch {
            repository.updateUserProfile(name, email, dailyGoal, preferredLang)
            _preferredLanguage.value = preferredLang
        }
    }

    // --- Preference Actions ---
    fun toggleDarkMode() {
        _isDarkMode.value = !_isDarkMode.value
    }

    fun toggleNotifications() {
        _isNotificationEnabled.value = !_isNotificationEnabled.value
    }

    fun setReminderTime(time: String) {
        _dailyReminderTime.value = time
    }

    fun setPreferredLanguage(lang: String) {
        _preferredLanguage.value = lang
    }

    // --- Solution Generation ---
    fun generateSolution(problemIdentifier: String, language: String, enableHighThinking: Boolean = true) {
        if (problemIdentifier.isBlank()) {
            _solutionState.value = SolutionState.Error("Please enter a valid problem slug, URL, or number.")
            return
        }
        viewModelScope.launch {
            _solutionState.value = SolutionState.Loading
            repository.saveSearch(problemIdentifier) // Save search query
            
            val solution = repository.generateDailyLeetCodeSolution(problemIdentifier, language, enableHighThinking)
            if (solution.contains("Network Error") || solution.contains("API Key is not configured")) {
                _solutionState.value = SolutionState.Error(solution)
            } else {
                // Parse a clean title and difficulty from response if possible or use fallback
                val title = if (problemIdentifier.startsWith("http")) {
                    problemIdentifier.substringAfterLast("/problems/").substringBefore("/").replace("-", " ").capitalize()
                } else {
                    problemIdentifier
                }
                
                _solutionState.value = SolutionState.Success(
                    response = solution,
                    problemId = problemIdentifier.trim(),
                    language = language
                )
            }
        }
    }

    fun clearSolutionState() {
        _solutionState.value = SolutionState.Idle
    }

    // --- Mark Problem as Studied ---
    fun markProblemAsStudied(
        problemId: String,
        title: String,
        difficulty: String,
        topic: String,
        notes: String,
        codeSolution: String,
        language: String,
        url: String
    ) {
        viewModelScope.launch {
            val solvedProblem = SolvedProblemEntity(
                problemId = problemId,
                title = title,
                difficulty = difficulty,
                topic = topic,
                solvedDate = System.currentTimeMillis(),
                notes = notes,
                codeSolution = codeSolution,
                language = language,
                url = url,
                bookmarked = false,
                favorite = false
            )
            repository.saveSolvedProblem(solvedProblem)
            repository.incrementStreakAndXP(difficulty) // Award XP based on difficulty
        }
    }

    fun toggleBookmark(problem: SolvedProblemEntity) {
        viewModelScope.launch {
            val updated = problem.copy(bookmarked = !problem.bookmarked)
            repository.saveSolvedProblem(updated)
        }
    }

    fun toggleFavorite(problem: SolvedProblemEntity) {
        viewModelScope.launch {
            val updated = problem.copy(favorite = !problem.favorite)
            repository.saveSolvedProblem(updated)
        }
    }

    fun updateNotes(problem: SolvedProblemEntity, notes: String) {
        viewModelScope.launch {
            val updated = problem.copy(notes = notes)
            repository.saveSolvedProblem(updated)
        }
    }

    fun deleteProblem(problemId: String) {
        viewModelScope.launch {
            repository.deleteProblem(problemId)
        }
    }

    // --- Revisions ---
    fun rateRevision(problemId: String, score: Int) {
        viewModelScope.launch {
            repository.saveRevision(problemId, score)
            repository.awardXp(50) // Award +50 XP for completing a revision review
        }
    }

    // --- Chat Doubts Assistant ---
    fun sendDoubtMessage(question: String) {
        if (question.isBlank()) return
        
        val userMsg = ChatMessage(question, true)
        _chatMessages.value = _chatMessages.value + userMsg

        val newCount = _chatQuestionsCount.value + 1
        _chatQuestionsCount.value = newCount
        sharedPrefs.edit().putInt("chat_questions_count", newCount).apply()
        
        viewModelScope.launch {
            _isChatLoading.value = true
            
            // Map history to Gemini format Content/Part structure
            val history = _chatMessages.value.takeLast(10).map { msg ->
                Content(parts = listOf(Part(text = if (msg.isUser) "User: ${msg.text}" else "Assistant: ${msg.text}")))
            }

            val response = repository.askDsaDoubt(question, history, _isSocraticMode.value)
            
            val botMsg = ChatMessage(response, false)
            _chatMessages.value = _chatMessages.value + botMsg
            _isChatLoading.value = false
            repository.awardXp(25) // Award +25 XP for asking and studying a DSA concept
        }
    }

    fun clearChat() {
        _chatMessages.value = listOf(
            ChatMessage("Chat cleared! Ask me any Data Structures or Algorithms doubts.", false)
        )
    }

    // --- Search History Actions ---
    fun deleteSearchQuery(query: String) {
        viewModelScope.launch {
            repository.deleteSearch(query)
        }
    }

    fun clearAllSearchHistory() {
        viewModelScope.launch {
            repository.clearSearchHistory()
        }
    }
}
