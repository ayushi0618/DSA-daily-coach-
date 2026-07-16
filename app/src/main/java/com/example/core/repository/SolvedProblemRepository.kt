package com.example.core.repository

import android.content.Context
import android.util.Log
import com.example.core.database.AppDatabase
import com.example.core.database.RevisionEntity
import com.example.core.database.SearchHistoryEntity
import com.example.core.database.SolvedProblemEntity
import com.example.core.database.UserEntity
import com.example.core.network.GeminiClient
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext

class SolvedProblemRepository(context: Context) {
    private val db = AppDatabase.getDatabase(context)
    private val userDao = db.userDao()
    private val problemDao = db.solvedProblemDao()
    private val revisionDao = db.revisionDao()
    private val searchDao = db.searchHistoryDao()

    private var firebaseAuth: FirebaseAuth? = null
    private var firestore: FirebaseFirestore? = null

    init {
        try {
            firebaseAuth = FirebaseAuth.getInstance()
            firestore = FirebaseFirestore.getInstance()
            Log.d("SolvedProblemRepository", "Firebase Auth & Firestore initialized successfully.")
        } catch (e: Exception) {
            Log.w("SolvedProblemRepository", "Firebase not initialized. Falling back to offline-only Room storage: ${e.localizedMessage}")
        }
    }

    // --- Authentication ---
    fun isFirebaseAvailable(): Boolean {
        return firebaseAuth != null && firestore != null
    }

    fun getCurrentUserUid(): String {
        return firebaseAuth?.currentUser?.uid ?: "local_user_id"
    }

    fun getActiveUserFlow(): Flow<UserEntity?> {
        return userDao.getUserFlow().flowOn(Dispatchers.IO)
    }

    suspend fun ensureUserExists() = withContext(Dispatchers.IO) {
        val uid = getCurrentUserUid()
        val localUser = userDao.getUserDirect()
        if (localUser == null) {
            val defaultUser = UserEntity(
                uid = uid,
                displayName = firebaseAuth?.currentUser?.displayName ?: "DSA Scholar",
                email = firebaseAuth?.currentUser?.email ?: "ayushi.singh0618@gmail.com",
                photoUrl = firebaseAuth?.currentUser?.photoUrl?.toString() ?: "",
                joinedDate = System.currentTimeMillis(),
                streak = 3, // Mock a 3-day starting streak for high aesthetic appeal
                totalProblems = 0,
                dailyGoal = 1,
                preferredLanguage = "Java",
                xpPoints = 120, // Start with some XP to look exciting
                level = 1
            )
            userDao.insertUser(defaultUser)
        }
    }

    suspend fun updateUserProfile(
        displayName: String,
        email: String,
        dailyGoal: Int,
        preferredLanguage: String
    ) = withContext(Dispatchers.IO) {
        val current = userDao.getUserDirect()
        if (current != null) {
            val updated = current.copy(
                displayName = displayName,
                email = email,
                dailyGoal = dailyGoal,
                preferredLanguage = preferredLanguage
            )
            userDao.insertUser(updated)
            syncUserToFirestore(updated)
        }
    }

    suspend fun incrementStreakAndXP() = withContext(Dispatchers.IO) {
        val current = userDao.getUserDirect()
        if (current != null) {
            val xpGain = 50
            val newXp = current.xpPoints + xpGain
            val newLevel = (newXp / 200) + 1
            val updated = current.copy(
                streak = current.streak + 1,
                totalProblems = current.totalProblems + 1,
                xpPoints = newXp,
                level = newLevel
            )
            userDao.insertUser(updated)
            syncUserToFirestore(updated)
        }
    }

    private suspend fun syncUserToFirestore(user: UserEntity) {
        val dbStore = firestore ?: return
        val authUser = firebaseAuth?.currentUser ?: return
        try {
            dbStore.collection("users").document(authUser.uid).set(user).await()
            Log.d("SolvedProblemRepository", "Synced user profile to Firestore successfully.")
        } catch (e: Exception) {
            Log.e("SolvedProblemRepository", "Firestore profile sync failed: ${e.localizedMessage}")
        }
    }

    // --- Solved Problems ---
    fun getAllSolvedProblems(): Flow<List<SolvedProblemEntity>> {
        return problemDao.getAllProblemsFlow().flowOn(Dispatchers.IO)
    }

    fun getBookmarkedProblems(): Flow<List<SolvedProblemEntity>> {
        return problemDao.getBookmarksFlow().flowOn(Dispatchers.IO)
    }

    fun getProblemFlow(id: String): Flow<SolvedProblemEntity?> {
        return problemDao.getProblemFlowById(id).flowOn(Dispatchers.IO)
    }

    suspend fun saveSolvedProblem(problem: SolvedProblemEntity) = withContext(Dispatchers.IO) {
        problemDao.insertProblem(problem)
        // Sync to Firestore
        val dbStore = firestore ?: return@withContext
        val authUser = firebaseAuth?.currentUser ?: return@withContext
        try {
            val firestoreData = mapOf(
                "userId" to authUser.uid,
                "problemId" to problem.problemId,
                "title" to problem.title,
                "difficulty" to problem.difficulty,
                "topic" to problem.topic,
                "solvedDate" to problem.solvedDate,
                "notes" to problem.notes,
                "revisionCount" to problem.revisionCount,
                "codeSolution" to problem.codeSolution,
                "language" to problem.language,
                "url" to problem.url,
                "bookmarked" to problem.bookmarked,
                "favorite" to problem.favorite
            )
            dbStore.collection("solved_problems")
                .document("${authUser.uid}_${problem.problemId}")
                .set(firestoreData)
                .await()
            Log.d("SolvedProblemRepository", "Synced problem ${problem.problemId} to Firestore.")
        } catch (e: Exception) {
            Log.e("SolvedProblemRepository", "Firestore problem sync failed: ${e.localizedMessage}")
        }
    }

    suspend fun deleteProblem(id: String) = withContext(Dispatchers.IO) {
        problemDao.deleteProblemById(id)
        val dbStore = firestore ?: return@withContext
        val authUser = firebaseAuth?.currentUser ?: return@withContext
        try {
            dbStore.collection("solved_problems")
                .document("${authUser.uid}_$id")
                .delete()
                .await()
        } catch (e: Exception) {
            Log.e("SolvedProblemRepository", "Firestore problem delete failed: ${e.localizedMessage}")
        }
    }

    // --- Revisions ---
    fun getAllRevisions(): Flow<List<RevisionEntity>> {
        return revisionDao.getAllRevisionsFlow().flowOn(Dispatchers.IO)
    }

    suspend fun saveRevision(problemId: String, score: Int) = withContext(Dispatchers.IO) {
        val revision = RevisionEntity(
            problemId = problemId,
            revisionDate = System.currentTimeMillis(),
            score = score
        )
        revisionDao.insertRevision(revision)

        // Increment revision count of the problem
        val problem = problemDao.getProblemById(problemId)
        if (problem != null) {
            val updated = problem.copy(revisionCount = problem.revisionCount + 1)
            problemDao.insertProblem(updated)
            saveSolvedProblem(updated)
        }

        // Add 25 XP for revising
        val current = userDao.getUserDirect()
        if (current != null) {
            val newXp = current.xpPoints + 25
            val newLevel = (newXp / 200) + 1
            userDao.insertUser(current.copy(xpPoints = newXp, level = newLevel))
        }

        // Sync to Firestore
        val dbStore = firestore ?: return@withContext
        val authUser = firebaseAuth?.currentUser ?: return@withContext
        try {
            val firestoreData = mapOf(
                "userId" to authUser.uid,
                "problemId" to problemId,
                "revisionDate" to revision.revisionDate,
                "score" to score
            )
            dbStore.collection("revisions")
                .add(firestoreData)
                .await()
        } catch (e: Exception) {
            Log.e("SolvedProblemRepository", "Firestore revision sync failed: ${e.localizedMessage}")
        }
    }

    // --- Search History ---
    fun getSearchHistory(): Flow<List<SearchHistoryEntity>> {
        return searchDao.getRecentSearchHistoryFlow().flowOn(Dispatchers.IO)
    }

    suspend fun saveSearch(query: String) = withContext(Dispatchers.IO) {
        if (query.isNotBlank()) {
            searchDao.insertSearch(SearchHistoryEntity(query.trim()))
        }
    }

    suspend fun deleteSearch(query: String) = withContext(Dispatchers.IO) {
        searchDao.deleteSearch(query)
    }

    suspend fun clearSearchHistory() = withContext(Dispatchers.IO) {
        searchDao.clearHistory()
    }

    // --- Gemini Content Generation ---
    suspend fun generateDailyLeetCodeSolution(
        problemIdentifier: String, // Number or URL or Title
        programmingLanguage: String,
        enableHighThinking: Boolean = true
    ): String {
        val prompt = """
            You are an elite Silicon Valley software engineer interviewer and computer science professor.
            Provide a complete, production-grade guide to LeetCode / DSA problem: "$problemIdentifier" in $programmingLanguage.
            
            Your response MUST strictly include all 11 of the following numbered sections. For code blocks, wrap them in markdown syntax formatting for the language.
            
            1. Problem Summary:
            Explain the core problem, inputs, outputs, and what needs to be solved.
            
            2. Brute-Force Approach:
            Detail the simple/naive way to solve it, explaining the basic steps.
            
            3. Optimized Approach:
            Detail the optimal strategy, data structures, and algorithms to use (e.g., hash maps, two pointers, binary search).
            
            4. Intuition:
            Explain the "Aha!" moment or the core logic behind the optimized solution.
            
            5. Dry Run:
            Provide a step-by-step trace of a small example input passing through the optimized algorithm.
            
            6. Time Complexity:
            Explain the Big O time complexity of both brute force and optimized approaches.
            
            7. Space Complexity:
            Explain the auxiliary space used.
            
            8. Edge Cases:
            List 4-5 edge cases to verify (e.g. empty lists, negative inputs, large constraints, duplicates).
            
            9. Interview Tips:
            What questions should a candidate ask the interviewer? How should they present this solution?
            
            10. Common Mistakes:
            List mistakes candidates make when coding this (e.g. index out of bounds, integer overflow, unhandled nulls).
            
            11. Clean Code in the selected language:
            Provide complete, clean, self-contained, well-commented code in $programmingLanguage using modern best practices.
            
            Strictly do not skip any of the sections, keep the layout extremely clean using precise markdown formatting.
        """.trimIndent()

        val systemInstruction = """
            You are "DSA Daily Coach" - a warm, highly-knowledgeable Computer Science mentor who writes beautiful, precise DSA guides.
            Always output detailed responses structured exactly according to the user's requested 11 sections.
            Always use Markdown headers (##) and bolding for emphasis, and use crisp markdown code blocks with syntax tags.
        """.trimIndent()

        return GeminiClient.generateContent(
            prompt = prompt,
            model = "gemini-3.5-flash",
            systemInstruction = systemInstruction,
            enableHighThinking = enableHighThinking
        )
    }

    suspend fun askDsaDoubt(question: String, chatHistory: List<com.example.core.network.Content>, isSocraticMode: Boolean = false): String {
        val systemInstruction = if (isSocraticMode) {
            "You are a Socratic DSA Coach. Do not give the direct answer immediately. Instead, ask the user what they are thinking, how they would approach it, and slowly guide them step-by-step to the correct solution. Provide hints and encourage their critical thinking."
        } else {
            "You are DSA Daily Coach AI Assistant. Provide helpful, conversational, and direct explanations for Data Structures and Algorithms questions. Use code snippets and bullet points where helpful."
        }

        
        // We can build the prompt or history, for now let's make a combined text call or structured history:
        val prompt = if (chatHistory.isEmpty()) {
            question
        } else {
            val historyText = chatHistory.flatMap { it.parts }.mapNotNull { it.text }.joinToString("\n")
            "$historyText\nUser: $question\nAssistant:"
        }

        return GeminiClient.generateContent(
            prompt = prompt,
            model = "gemini-3.5-flash",
            systemInstruction = systemInstruction
        )
    }
}
