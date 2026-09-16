package com.example.features.onboarding

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.ExperienceXp
import com.example.ui.theme.StreakGold

data class OnboardingStep(
    val stepNumber: Int,
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val accentColor: Color,
    val keyPoints: List<Pair<ImageVector, String>>,
    val previewBadgeText: String
)

@Composable
fun OnboardingScreen(
    onFinish: () -> Unit
) {
    val steps = remember {
        listOf(
            OnboardingStep(
                stepNumber = 1,
                title = "Solve Daily LeetCode",
                subtitle = "Master one problem every day with your personal AI Coach",
                icon = Icons.Default.AutoAwesome,
                accentColor = Color(0xFF6C63FF),
                keyPoints = listOf(
                    Icons.Default.Search to "Enter any LeetCode problem ID, URL, or algorithm topic",
                    Icons.Default.Code to "Supports Java, C++, Python, and JavaScript code solutions",
                    Icons.Default.Psychology to "Toggle Deep Reasoning for step-by-step thinking breakdown"
                ),
                previewBadgeText = "Step 1 of 4 • Problem Discovery"
            ),
            OnboardingStep(
                stepNumber = 2,
                title = "Understand AI Solutions",
                subtitle = "Go beyond code: grasp the core intuition and complexity trade-offs",
                icon = Icons.Default.Lightbulb,
                accentColor = Color(0xFF00BFA5),
                keyPoints = listOf(
                    Icons.Default.CheckCircle to "Intuition breakdown explains WHY the approach works",
                    Icons.Default.Speed to "Clear Time (O(N)) and Space (O(1)) Big-O complexity notes",
                    Icons.Default.QuestionAnswer to "Socratic Mode prompts guiding questions rather than direct answers"
                ),
                previewBadgeText = "Step 2 of 4 • Deep Intuition"
            ),
            OnboardingStep(
                stepNumber = 3,
                title = "Smart Spaced Revision",
                subtitle = "Retain algorithms and patterns effortlessly before high-stakes interviews",
                icon = Icons.Default.Cached,
                accentColor = Color(0xFFFF9100),
                keyPoints = listOf(
                    Icons.Default.Star to "Rate retention from 1 to 5 after reviewing any solution",
                    Icons.Default.Schedule to "Smart schedule surfaces tricky problems right before you forget them",
                    Icons.Default.Bookmark to "Bookmark favorite patterns and add custom study notes"
                ),
                previewBadgeText = "Step 3 of 4 • Retention Engine"
            ),
            OnboardingStep(
                stepNumber = 4,
                title = "Gamification & AI Doubts",
                subtitle = "Earn XP, unlock achievement badges, and ask 24/7 DSA questions",
                icon = Icons.Default.EmojiEvents,
                accentColor = Color(0xFFFF4081),
                keyPoints = listOf(
                    Icons.Default.MilitaryTech to "Earn XP for every solve and level up from Novice to DP Grandmaster",
                    Icons.Default.LocalFireDepartment to "Keep a study streak and collect milestone badges",
                    Icons.Default.Chat to "Dedicated AI Chat assistant clarifies any tricky DSA doubts instantly"
                ),
                previewBadgeText = "Step 4 of 4 • Level Up & Coach"
            )
        )
    }

    var currentStepIndex by remember { mutableStateOf(0) }
    val step = steps[currentStepIndex]
    val isLastStep = currentStepIndex == steps.size - 1

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .testTag("onboarding_screen"),
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "DSA DAILY COACH",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )

                if (!isLastStep) {
                    TextButton(
                        onClick = onFinish,
                        modifier = Modifier.testTag("onboarding_skip_button")
                    ) {
                        Text("Skip", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                    }
                }
            }
        },
        bottomBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Step Indicator Dots
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(bottom = 20.dp)
                ) {
                    steps.indices.forEach { index ->
                        val isSelected = index == currentStepIndex
                        Box(
                            modifier = Modifier
                                .height(8.dp)
                                .width(if (isSelected) 28.dp else 8.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .background(
                                    if (isSelected) MaterialTheme.colorScheme.primary
                                    else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.2f)
                                )
                        )
                    }
                }

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (currentStepIndex > 0) {
                        OutlinedButton(
                            onClick = { currentStepIndex-- },
                            modifier = Modifier
                                .weight(1f)
                                .height(54.dp),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back"
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Back")
                        }
                    }

                    Button(
                        onClick = {
                            if (isLastStep) {
                                onFinish()
                            } else {
                                currentStepIndex++
                            }
                        },
                        modifier = Modifier
                            .weight(if (currentStepIndex > 0) 1.5f else 1f)
                            .height(54.dp)
                            .testTag("onboarding_next_button"),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                    ) {
                        Text(
                            text = if (isLastStep) "Start Learning Now" else "Next Step",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Icon(
                            imageVector = if (isLastStep) Icons.Default.Check else Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = "Continue"
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(12.dp))

            // Step Category Pill
            Surface(
                color = step.accentColor.copy(alpha = 0.12f),
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, step.accentColor.copy(alpha = 0.25f))
            ) {
                Text(
                    text = step.previewBadgeText,
                    style = MaterialTheme.typography.labelSmall,
                    color = step.accentColor,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Animated Visual Card
            AnimatedContent(
                targetState = step,
                transitionSpec = { fadeIn() togetherWith fadeOut() },
                label = "onboarding_card"
            ) { currentStep ->
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    // Feature Icon Orb
                    Box(
                        modifier = Modifier
                            .size(100.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.radialGradient(
                                    listOf(
                                        currentStep.accentColor.copy(alpha = 0.35f),
                                        currentStep.accentColor.copy(alpha = 0.05f)
                                    )
                                )
                            )
                            .border(2.dp, currentStep.accentColor.copy(alpha = 0.5f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = currentStep.icon,
                            contentDescription = currentStep.title,
                            tint = currentStep.accentColor,
                            modifier = Modifier.size(46.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = currentStep.title,
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.ExtraBold,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onBackground
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = currentStep.subtitle,
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                        lineHeight = 20.sp,
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )

                    Spacer(modifier = Modifier.height(28.dp))

                    // Feature Checklist Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f)
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(18.dp),
                            verticalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            currentStep.keyPoints.forEach { (icon, text) ->
                                Row(
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(36.dp)
                                            .clip(CircleShape)
                                            .background(currentStep.accentColor.copy(alpha = 0.15f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = icon,
                                            contentDescription = null,
                                            tint = currentStep.accentColor,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }

                                    Spacer(modifier = Modifier.width(14.dp))

                                    Text(
                                        text = text,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSurface,
                                        fontWeight = FontWeight.Medium,
                                        lineHeight = 19.sp,
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}
