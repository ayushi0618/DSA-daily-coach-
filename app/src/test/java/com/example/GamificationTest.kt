package com.example

import com.example.core.database.SolvedProblemEntity
import com.example.core.database.UserEntity
import com.example.core.gamification.GamificationManager
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class GamificationTest {

    @Test
    fun testLevelProgression() {
        val lvl1 = GamificationManager.getLevelInfo(0)
        assertEquals(1, lvl1.level)
        assertEquals("Apprentice Coder", lvl1.title)
        assertEquals(200, lvl1.xpNeededForNextLevel)

        val lvl2 = GamificationManager.getLevelInfo(250)
        assertEquals(2, lvl2.level)
        assertEquals("Syntax Solver", lvl2.title)

        val highLvl = GamificationManager.getLevelInfo(2500)
        assertEquals(6, highLvl.level)
        assertEquals("Grandmaster", highLvl.title)
    }

    @Test
    fun testBadgesComputation() {
        val user = UserEntity(
            uid = "test_user",
            displayName = "Scholar",
            email = "scholar@example.com",
            streak = 7,
            xpPoints = 600,
            level = 3
        )
        val solved = listOf(
            SolvedProblemEntity(
                id = "p1",
                title = "Two Sum",
                platform = "LeetCode",
                difficulty = "Easy",
                dateSolved = "2026-09-15"
            ),
            SolvedProblemEntity(
                id = "p2",
                title = "Reverse Linked List",
                platform = "LeetCode",
                difficulty = "Medium",
                dateSolved = "2026-09-15"
            )
        )
        val badges = GamificationManager.computeBadges(
            user = user,
            solvedProblems = solved,
            revisionLogs = emptyList(),
            chatQuestionsCount = 3
        )

        // First Problem badge should be unlocked
        val firstProblemBadge = badges.find { it.id == "first_problem" }
        assertTrue(firstProblemBadge?.isUnlocked == true)

        // 5-Day Streak badge should be unlocked (streak = 7)
        val streakBadge = badges.find { it.id == "streak_5" }
        assertTrue(streakBadge?.isUnlocked == true)

        // Inquisitive Mind badge should be unlocked (chatQuestionsCount = 3 >= 3)
        val chatBadge = badges.find { it.id == "chat_explorer" }
        assertTrue(chatBadge?.isUnlocked == true)
    }
}
