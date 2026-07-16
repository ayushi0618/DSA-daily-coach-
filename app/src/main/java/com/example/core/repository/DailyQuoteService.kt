package com.example.core.repository

import java.util.Calendar

object DailyQuoteService {
    private val quotes = listOf(
        "Consistency beats intensity. One DSA problem a day builds ultimate mastery!",
        "Optimize your code like you optimize your life: minimize complexity, maximize output.",
        "Dynamic Programming: Solve the subproblems, and the grand solution will reveal itself.",
        "The best way to understand a complex tree structure is to walk through it, node by node.",
        "Every expert coder once struggled with Two Sum. Keep pushing, you are leveling up!",
        "An elegant algorithm is like a beautiful poem: concise, powerful, and timeless.",
        "Data structures are the architecture of thought; algorithms are the execution of logic.",
        "Bugs are just opportunities to understand your own code at a deeper level.",
        "Premature optimization is the root of all evil. Write clean code first, optimize where it matters.",
        "The best code is no code at all. The second best is simple, readable, and highly focused.",
        "Do not fear recursion. Fear the lack of a proper base case.",
        "In the search for efficiency, sometimes the simplest hash map is your greatest ally."
    )

    fun getQuoteForToday(): String {
        val calendar = Calendar.getInstance()
        val dayOfYear = calendar.get(Calendar.DAY_OF_YEAR)
        val index = dayOfYear % quotes.size
        return quotes[index]
    }
}
