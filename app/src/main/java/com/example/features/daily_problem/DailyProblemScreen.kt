package com.example.features.daily_problem

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.features.providers.DsaViewModel
import com.example.features.providers.SolutionState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DailyProblemScreen(
    viewModel: DsaViewModel,
    onNavigateToSolution: (String, String) -> Unit
) {
    var inputQuery by remember { mutableStateFlowOf("") }
    var selectedLanguage by remember { mutableStateFlowOf("Java") }
    var deepReasoningEnabled by remember { mutableStateOf(true) }

    val searchHistory by viewModel.searchHistory.collectAsState()
    val solutionState by viewModel.solutionState.collectAsState()

    val languages = remember { listOf("Java", "C++", "Python", "JavaScript") }

    // When the solution is successfully generated, automatically navigate to the Solution screen!
    LaunchedEffect(solutionState) {
        if (solutionState is SolutionState.Success) {
            val success = solutionState as SolutionState.Success
            onNavigateToSolution(success.problemId, success.language)
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("daily_problem_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Heading Header
        item {
            Column(modifier = Modifier.padding(vertical = 12.dp)) {
                Text(
                    text = "SOLVE WITH COACH",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 2.dp)
                )
                Text(
                    text = "Generate Solution.",
                    style = MaterialTheme.typography.displayLarge,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Enter any LeetCode problem ID, URL, or topic to compile a comprehensive, optimized coach guide.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                    modifier = Modifier.padding(top = 6.dp)
                )
            }
        }

        // 2. Main Generation Inputs Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(24.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "PROBLEM DISCOVERY",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    OutlinedTextField(
                        value = inputQuery,
                        onValueChange = { inputQuery = it },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("leetcode_input"),
                        label = { Text("LeetCode ID, URL or Title") },
                        placeholder = { Text("e.g., 1. Two Sum or https://leetcode.com/problems/two-sum/") },
                        leadingIcon = {
                            Icon(imageVector = Icons.Default.Terminal, contentDescription = "Terminal")
                        },
                        trailingIcon = {
                            if (inputQuery.isNotEmpty()) {
                                IconButton(onClick = { inputQuery = "" }) {
                                    Icon(imageVector = Icons.Default.Close, contentDescription = "Clear")
                                }
                            }
                        },
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "PROGRAMMING LANGUAGE",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    // Language chips list
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        languages.forEach { lang ->
                            val isSelected = selectedLanguage == lang
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(
                                        if (isSelected) MaterialTheme.colorScheme.primary
                                        else MaterialTheme.colorScheme.primary.copy(alpha = 0.05f)
                                    )
                                    .clickable { selectedLanguage = lang }
                                    .padding(vertical = 12.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = lang,
                                    color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface,
                                    fontWeight = FontWeight.Bold,
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Deep reasoning mode toggle
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(MaterialTheme.colorScheme.secondary.copy(alpha = 0.08f))
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Psychology,
                                    contentDescription = "Thinking mode",
                                    tint = MaterialTheme.colorScheme.secondary
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Deep Reasoning Mode",
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Text(
                                text = "Uses Gemini 3.5 Flash with high thinking mode for elite analytical details.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                                modifier = Modifier.padding(top = 2.dp)
                            )
                        }

                        Switch(
                            checked = deepReasoningEnabled,
                            onCheckedChange = { deepReasoningEnabled = it }
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Main solve CTA
                    Button(
                        onClick = {
                            viewModel.generateSolution(inputQuery, selectedLanguage, deepReasoningEnabled)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .testTag("generate_button"),
                        enabled = solutionState !is SolutionState.Loading && inputQuery.isNotBlank(),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        if (solutionState is SolutionState.Loading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                color = MaterialTheme.colorScheme.onPrimary,
                                strokeWidth = 2.5.dp
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text("Analyzing DSA Logic...", fontWeight = FontWeight.Bold)
                        } else {
                            Icon(imageVector = Icons.Default.AutoAwesome, contentDescription = "Generate")
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Generate Coach Guide", fontWeight = FontWeight.Bold)
                        }
                    }

                    // Display errors
                    AnimatedVisibility(visible = solutionState is SolutionState.Error) {
                        val errMsg = (solutionState as? SolutionState.Error)?.message ?: ""
                        Column(modifier = Modifier.padding(top = 16.dp)) {
                            Card(
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Warning,
                                        contentDescription = "Error",
                                        tint = MaterialTheme.colorScheme.error
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = errMsg,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onErrorContainer
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // 3. Search History / Recent Queries List
        if (searchHistory.isNotEmpty()) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Recent Searches",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    TextButton(onClick = { viewModel.clearAllSearchHistory() }) {
                        Text("Clear All", fontSize = 12.sp)
                    }
                }
            }

            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(searchHistory) { history ->
                        SuggestionChip(
                            onClick = { inputQuery = history.query },
                            label = { Text(history.query) },
                            icon = {
                                Icon(
                                    imageVector = Icons.Default.History,
                                    contentDescription = "History item",
                                    modifier = Modifier.size(14.dp)
                                )
                            }
                        )
                    }
                }
            }
        }

        // 4. Quick Examples Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(24.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "POPULAR LEETCODE PROMPTS",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                        modifier = Modifier.padding(bottom = 12.dp)
                    )

                    val samples = listOf(
                        "1. Two Sum" to "Arrays & Hash Table",
                        "206. Reverse Linked List" to "Linked List",
                        "704. Binary Search" to "Binary Search",
                        "121. Best Time to Buy and Sell Stock" to "Sliding Window"
                    )

                    samples.forEach { (title, tag) ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { inputQuery = title }
                                .padding(vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = title,
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Text(
                                    text = tag,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                                )
                            }

                            Icon(
                                imageVector = Icons.Default.ArrowOutward,
                                contentDescription = "Use prompt",
                                tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                        HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.05f))
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(60.dp)) // Avoid nav bar overlap
        }
    }
}

// Custom remember state helper to bypass serialization or compile limits in basic Compose
@Composable
fun rememberMutableStateFlowOf(init: String): MutableState<String> {
    return remember { mutableStateOf(init) }
}
fun <T> mutableStateFlowOf(value: T): MutableState<T> = mutableStateOf(value)
