package com.example.core.gamification

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector
import com.example.core.database.RevisionEntity
import com.example.core.database.SolvedProblemEntity
import com.example.core.database.UserEntity

data class AchievementBadge(
    val id: String,
    val title: String,
    val description: String,
    val icon: ImageVector,
    val xpReward: Int,
    val isUnlocked: Boolean,
    val progress: Float, // 0.0f to 1.0f
    val progressLabel: String
)

data class UserLevelInfo(
    val level: Int,
    val title: String,
    val minXp: Int,
    val maxXp: Int,
    val currentLevelProgress: Float, // 0.0f to 1.0f
    val xpInCurrentLevel: Int,
    val xpNeededForNextLevel: Int
)

object GamificationManager {

    private val LEVEL_TIERS = listOf(
        Pair(1, "Novice Coder") to (0 to 300),
        Pair(2, "Array Apprentice") to (300 to 700),
        Pair(3, "Recursion Explorer") to (700 to 1300),
        Pair(4, "Tree Specialist") to (1300 to 2200),
        Pair(5, "Graph Conqueror") to (2200 to 3500),
        Pair(6, "DP Grandmaster") to (3500 to 5000),
        Pair(7, "Algorithm Architect") to (5000 to 10000)
    )

    fun getLevelInfo(totalXp: Int): UserLevelInfo {
        for ((tier, range) in LEVEL_TIERS) {
            val (minXp, maxXp) = range
            if (totalXp in minXp until maxXp) {
                val span = (maxXp - minXp).coerceAtLeast(1)
                val currentInSpan = (totalXp - minXp).coerceAtLeast(0)
                val progress = (currentInSpan.toFloat() / span.toFloat()).coerceIn(0f, 1f)
                return UserLevelInfo(
                    level = tier.first,
                    title = tier.second,
                    minXp = minXp,
                    maxXp = maxXp,
                    currentLevelProgress = progress,
                    xpInCurrentLevel = currentInSpan,
                    xpNeededForNextLevel = maxXp - totalXp
                )
            }
        }

        // Over max tier
        val lastTier = LEVEL_TIERS.last()
        return UserLevelInfo(
            level = lastTier.first.first,
            title = lastTier.first.second,
            minXp = lastTier.second.first,
            maxXp = lastTier.second.second,
            currentLevelProgress = 1f,
            xpInCurrentLevel = totalXp - lastTier.second.first,
            xpNeededForNextLevel = 0
        )
    }

    fun computeBadges(
        user: UserEntity?,
        solvedProblems: List<SolvedProblemEntity>,
        revisions: List<RevisionEntity>,
        chatQueriesCount: Int = 0
    ): List<AchievementBadge> {
        val totalProblems = solvedProblems.size
        val currentStreak = user?.streak ?: 0
        val totalXp = user?.xpPoints ?: 0

        // Languages count
        val distinctLanguages = solvedProblems.map { it.language }.distinct().size

        // Hard problems count
        val hardCount = solvedProblems.count { it.difficulty.equals("Hard", ignoreCase = true) }

        val badges = mutableListOf<AchievementBadge>()

        // 1. First Step
        badges.add(
            AchievementBadge(
                id = "first_step",
                title = "First Step",
                description = "Solve your very first DSA problem with Coach",
                icon = Icons.Default.PlayArrow,
                xpReward = 100,
                isUnlocked = totalProblems >= 1,
                progress = (totalProblems / 1f).coerceIn(0f, 1f),
                progressLabel = "$totalProblems / 1"
            )
        )

        // 2. 5-Day Streak
        badges.add(
            AchievementBadge(
                id = "5_day_streak",
                title = "5-Day Streak",
                description = "Maintain a consistent study streak for 5 days",
                icon = Icons.Default.LocalFireDepartment,
                xpReward = 250,
                isUnlocked = currentStreak >= 5,
                progress = (currentStreak / 5f).coerceIn(0f, 1f),
                progressLabel = "$currentStreak / 5 days"
            )
        )

        // 3. Mastered Algorithms
        badges.add(
            AchievementBadge(
                id = "mastered_algorithms",
                title = "Mastered Algorithms",
                description = "Solve and review at least 5 DSA problems",
                icon = Icons.Default.EmojiEvents,
                xpReward = 300,
                isUnlocked = totalProblems >= 5,
                progress = (totalProblems / 5f).coerceIn(0f, 1f),
                progressLabel = "$totalProblems / 5 solved"
            )
        )

        // 4. Polyglot Coder
        badges.add(
            AchievementBadge(
                id = "polyglot_coder",
                title = "Polyglot",
                description = "Generate and study solutions across 2+ languages",
                icon = Icons.Default.Translate,
                xpReward = 200,
                isUnlocked = distinctLanguages >= 2,
                progress = (distinctLanguages / 2f).coerceIn(0f, 1f),
                progressLabel = "$distinctLanguages / 2 languages"
            )
        )

        // 5. Revision Pro
        badges.add(
            AchievementBadge(
                id = "revision_pro",
                title = "Revision Pro",
                description = "Complete 3 spaced-repetition retention sessions",
                icon = Icons.Default.Cached,
                xpReward = 200,
                isUnlocked = revisions.size >= 3,
                progress = (revisions.size / 3f).coerceIn(0f, 1f),
                progressLabel = "${revisions.size} / 3 revisions"
            )
        )

        // 6. Socratic Thinker
        badges.add(
            AchievementBadge(
                id = "socratic_thinker",
                title = "Socratic Thinker",
                description = "Engage in guided Socratic discussions with AI Coach",
                icon = Icons.Default.Psychology,
                xpReward = 150,
                isUnlocked = chatQueriesCount >= 2,
                progress = (chatQueriesCount / 2f).coerceIn(0f, 1f),
                progressLabel = "$chatQueriesCount / 2 doubts"
            )
        )

        // 7. Century Club
        badges.add(
            AchievementBadge(
                id = "century_club",
                title = "Century Club",
                description = "Accumulate 1,000+ total developer XP points",
                icon = Icons.Default.MilitaryTech,
                xpReward = 500,
                isUnlocked = totalXp >= 1000,
                progress = (totalXp / 1000f).coerceIn(0f, 1f),
                progressLabel = "$totalXp / 1,000 XP"
            )
        )

        // 8. Hardcore Solver
        badges.add(
            AchievementBadge(
                id = "hardcore_solver",
                title = "Hardcore Solver",
                description = "Master a LeetCode Hard problem solution",
                icon = Icons.Default.WorkspacePremium,
                xpReward = 400,
                isUnlocked = hardCount >= 1,
                progress = (hardCount / 1f).coerceIn(0f, 1f),
                progressLabel = "$hardCount / 1 Hard"
            )
        )

        return badges
    }
}
