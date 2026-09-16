package com.example.core.streak

import com.example.core.database.SolvedProblemEntity
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.concurrent.TimeUnit

data class StreakDayStatus(
    val dayOfWeek: String,      // e.g. "MO", "TU", "WE"
    val dayOfMonth: Int,        // e.g. 15
    val dateString: String,     // "yyyy-MM-dd"
    val isSolved: Boolean,
    val isToday: Boolean,
    val isFuture: Boolean
)

data class StreakDetails(
    val currentStreak: Int,
    val longestStreak: Int,
    val isSolvedToday: Boolean,
    val totalSolvedDays: Int,
    val totalProblemsSolved: Int,
    val rollingWeek: List<StreakDayStatus>,
    val motivationalMessage: String
)

object StreakCalculator {
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    private val dayOfWeekFormat = SimpleDateFormat("EEE", Locale.getDefault())

    fun calculateStreak(problems: List<SolvedProblemEntity>): StreakDetails {
        if (problems.isEmpty()) {
            return StreakDetails(
                currentStreak = 0,
                longestStreak = 0,
                isSolvedToday = false,
                totalSolvedDays = 0,
                totalProblemsSolved = 0,
                rollingWeek = generateRollingWeek(emptySet()),
                motivationalMessage = "Solve today's challenge to kickstart your daily streak!"
            )
        }

        // Extract set of unique solved calendar dates (yyyy-MM-dd) from Room DB
        val solvedDateStrings = problems.map {
            dateFormat.format(Date(it.solvedDate))
        }.toSet()

        val todayCal = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val todayStr = dateFormat.format(todayCal.time)

        val yesterdayCal = (todayCal.clone() as Calendar).apply {
            add(Calendar.DAY_OF_YEAR, -1)
        }
        val yesterdayStr = dateFormat.format(yesterdayCal.time)

        val isSolvedToday = solvedDateStrings.contains(todayStr)
        val isSolvedYesterday = solvedDateStrings.contains(yesterdayStr)

        // Calculate current consecutive days streak
        var currentStreak = 0
        if (isSolvedToday) {
            currentStreak = 1
            val checkCal = (todayCal.clone() as Calendar).apply { add(Calendar.DAY_OF_YEAR, -1) }
            while (solvedDateStrings.contains(dateFormat.format(checkCal.time))) {
                currentStreak++
                checkCal.add(Calendar.DAY_OF_YEAR, -1)
            }
        } else if (isSolvedYesterday) {
            // Streak still active from yesterday!
            currentStreak = 1
            val checkCal = (yesterdayCal.clone() as Calendar).apply { add(Calendar.DAY_OF_YEAR, -1) }
            while (solvedDateStrings.contains(dateFormat.format(checkCal.time))) {
                currentStreak++
                checkCal.add(Calendar.DAY_OF_YEAR, -1)
            }
        } else {
            currentStreak = 0
        }

        // Calculate all-time longest consecutive streak from Room records
        val sortedDates = solvedDateStrings.mapNotNull {
            try { dateFormat.parse(it) } catch (e: Exception) { null }
        }.sorted()

        var longestStreak = 0
        var tempStreak = 0
        var prevDate: Date? = null

        for (d in sortedDates) {
            if (prevDate == null) {
                tempStreak = 1
            } else {
                val diffDays = TimeUnit.MILLISECONDS.toDays(d.time - prevDate.time)
                if (diffDays == 1L) {
                    tempStreak++
                } else if (diffDays > 1L) {
                    tempStreak = 1
                }
            }
            if (tempStreak > longestStreak) {
                longestStreak = tempStreak
            }
            prevDate = d
        }
        if (currentStreak > longestStreak) {
            longestStreak = currentStreak
        }

        val rollingWeek = generateRollingWeek(solvedDateStrings)

        val message = when {
            isSolvedToday -> "🔥 You're on fire! Solved today. Keep your momentum going tomorrow!"
            currentStreak > 0 -> "⚡ Solve today's challenge to protect your $currentStreak-day streak!"
            else -> "🌱 Start fresh today! Solve one problem to start your streak."
        }

        return StreakDetails(
            currentStreak = currentStreak,
            longestStreak = longestStreak,
            isSolvedToday = isSolvedToday,
            totalSolvedDays = solvedDateStrings.size,
            totalProblemsSolved = problems.size,
            rollingWeek = rollingWeek,
            motivationalMessage = message
        )
    }

    private fun generateRollingWeek(solvedDates: Set<String>): List<StreakDayStatus> {
        val list = mutableListOf<StreakDayStatus>()
        val cal = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val todayStr = dateFormat.format(cal.time)

        // Show a 7-day window ending on today (6 days ago through today)
        val startCal = (cal.clone() as Calendar).apply {
            add(Calendar.DAY_OF_YEAR, -6)
        }

        for (i in 0..6) {
            val date = startCal.time
            val dateStr = dateFormat.format(date)
            val isToday = (dateStr == todayStr)
            val isSolved = solvedDates.contains(dateStr)
            val dayOfWeek = dayOfWeekFormat.format(date).take(2).uppercase()
            val dayOfMonth = startCal.get(Calendar.DAY_OF_MONTH)

            list.add(
                StreakDayStatus(
                    dayOfWeek = dayOfWeek,
                    dayOfMonth = dayOfMonth,
                    dateString = dateStr,
                    isSolved = isSolved,
                    isToday = isToday,
                    isFuture = false
                )
            )
            startCal.add(Calendar.DAY_OF_YEAR, 1)
        }

        return list
    }
}
