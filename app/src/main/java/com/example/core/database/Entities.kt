package com.example.core.database

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val uid: String,
    val displayName: String,
    val email: String,
    val photoUrl: String,
    val joinedDate: Long,
    val streak: Int,
    val totalProblems: Int,
    val dailyGoal: Int,
    val preferredLanguage: String,
    val xpPoints: Int = 0,
    val level: Int = 1
)

@Entity(tableName = "solved_problems")
data class SolvedProblemEntity(
    @PrimaryKey val problemId: String, // Problem number or slug
    val title: String,
    val difficulty: String, // Easy, Medium, Hard
    val topic: String,
    val solvedDate: Long,
    val notes: String,
    val revisionCount: Int = 0,
    val codeSolution: String = "",
    val language: String = "Java",
    val url: String = "",
    val bookmarked: Boolean = false,
    val favorite: Boolean = false
)

@Entity(tableName = "revisions")
data class RevisionEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val problemId: String,
    val revisionDate: Long,
    val score: Int
)

@Entity(tableName = "search_history")
data class SearchHistoryEntity(
    @PrimaryKey val query: String,
    val timestamp: Long = System.currentTimeMillis()
)
