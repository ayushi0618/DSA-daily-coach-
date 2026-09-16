package com.example.features.lecture

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

enum class LectureScene(val title: String, val timestampStr: String) {
    PROBLEM_OVERVIEW("1. Problem & Goals", "00:00"),
    INTUITION("2. Core Intuition", "00:20"),
    SIMULATION("3. Live Simulation", "00:45"),
    COMPLEXITY("4. Big-O Summary", "01:10")
}

@Composable
fun AnimatedLecturePlayer(
    problemTitle: String,
    difficulty: String = "Medium",
    topic: String = "Algorithms",
    modifier: Modifier = Modifier,
    onClose: (() -> Unit)? = null
) {
    var isPlaying by remember { mutableStateOf(true) }
    var currentProgress by remember { mutableFloatStateOf(0.15f) } // 0.0 to 1.0
    var playbackSpeed by remember { mutableFloatStateOf(1.0f) }
    val totalDurationSeconds = 80f // 1m 20s lecture

    // Current lecture scene derived from playback progress
    val activeScene = remember(currentProgress) {
        when {
            currentProgress < 0.25f -> LectureScene.PROBLEM_OVERVIEW
            currentProgress < 0.55f -> LectureScene.INTUITION
            currentProgress < 0.85f -> LectureScene.SIMULATION
            else -> LectureScene.COMPLEXITY
        }
    }

    // Playback ticker effect
    LaunchedEffect(isPlaying, playbackSpeed) {
        while (isPlaying) {
            delay(100L)
            currentProgress = (currentProgress + (0.1f * playbackSpeed / totalDurationSeconds)).coerceIn(0f, 1f)
            if (currentProgress >= 1f) {
                isPlaying = false
            }
        }
    }

    // Animated pulsing for speaking professor and pointer
    val infiniteTransition = rememberInfiniteTransition(label = "lecture_anim")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(600, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse"
    )

    val currentSeconds = (currentProgress * totalDurationSeconds).toInt()
    val elapsedString = String.format("%02d:%02d", currentSeconds / 60, currentSeconds % 60)
    val totalString = "01:20"

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("animated_lecture_player"),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)), // Slate 900 chalkboard
        shape = RoundedCornerShape(24.dp),
        border = androidx.compose.foundation.BorderStroke(1.5.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.4f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // 1. Player Top Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(if (isPlaying) Color(0xFFEF4444) else Color.Gray)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (isPlaying) "LIVE ANIMATED LECTURE" else "LECTURE PAUSED",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Black,
                        color = if (isPlaying) Color(0xFFEF4444) else Color.Gray,
                        letterSpacing = 1.sp
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = "${playbackSpeed}x",
                            modifier = Modifier
                                .clickable {
                                    playbackSpeed = when (playbackSpeed) {
                                        1.0f -> 1.25f
                                        1.25f -> 1.5f
                                        1.5f -> 2.0f
                                        else -> 1.0f
                                    }
                                }
                                .padding(horizontal = 8.dp, vertical = 4.dp),
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }

                    if (onClose != null) {
                        Spacer(modifier = Modifier.width(6.dp))
                        IconButton(
                            onClick = onClose,
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Close Lecture",
                                tint = Color.White.copy(alpha = 0.7f),
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Classroom: $problemTitle",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            Text(
                text = "$topic • $difficulty Level Video Masterclass",
                style = MaterialTheme.typography.bodySmall,
                color = Color.LightGray.copy(alpha = 0.8f)
            )

            Spacer(modifier = Modifier.height(12.dp))

            // 2. Animated Blackboard Stage / Screen
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(210.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(
                        Brush.verticalGradient(
                            listOf(Color(0xFF030712), Color(0xFF111827))
                        )
                    )
                    .border(1.dp, Color(0xFF374151), RoundedCornerShape(16.dp))
                    .padding(14.dp)
            ) {
                // Scene Content
                when (activeScene) {
                    LectureScene.PROBLEM_OVERVIEW -> {
                        LectureProblemScene(problemTitle = problemTitle, pulseScale = pulseScale)
                    }
                    LectureScene.INTUITION -> {
                        LectureIntuitionScene(topic = topic, pulseScale = pulseScale)
                    }
                    LectureScene.SIMULATION -> {
                        LectureSimulationScene(progress = currentProgress)
                    }
                    LectureScene.COMPLEXITY -> {
                        LectureComplexityScene(difficulty = difficulty)
                    }
                }

                // Professor Avatar Floating Bubble
                Row(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .background(Color(0xCC1F2937), RoundedCornerShape(20.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(22.dp)
                            .scale(if (isPlaying) pulseScale else 1f)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primary),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.School,
                            contentDescription = "AI Professor",
                            tint = Color.White,
                            modifier = Modifier.size(13.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Prof. Algo AI",
                        fontSize = 10.sp,
                        color = Color.White,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // 3. Subtitles / Narrator Transcript Bar
            Surface(
                color = Color(0xFF1E293B),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.VolumeUp,
                        contentDescription = "Audio narration",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = getSubtitleForScene(activeScene, problemTitle),
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White.copy(alpha = 0.9f),
                        fontSize = 11.sp,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // 4. Scrub Bar & Timestamps
            Column(modifier = Modifier.fillMaxWidth()) {
                Slider(
                    value = currentProgress,
                    onValueChange = {
                        currentProgress = it
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(24.dp),
                    colors = SliderDefaults.colors(
                        thumbColor = MaterialTheme.colorScheme.primary,
                        activeTrackColor = MaterialTheme.colorScheme.primary,
                        inactiveTrackColor = Color(0xFF334155)
                    )
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = elapsedString,
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.Gray
                    )
                    Text(
                        text = activeScene.title,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = totalString,
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.Gray
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // 5. Video Playback Control Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Rewind 5s
                IconButton(
                    onClick = {
                        currentProgress = (currentProgress - (5f / totalDurationSeconds)).coerceAtLeast(0f)
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.Replay5,
                        contentDescription = "Rewind 5s",
                        tint = Color.White
                    )
                }

                // Play / Pause main button
                FilledIconButton(
                    onClick = {
                        if (currentProgress >= 1f) {
                            currentProgress = 0f
                            isPlaying = true
                        } else {
                            isPlaying = !isPlaying
                        }
                    },
                    modifier = Modifier.size(48.dp),
                    colors = IconButtonDefaults.filledIconButtonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Icon(
                        imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = if (isPlaying) "Pause" else "Play",
                        tint = Color.White,
                        modifier = Modifier.size(26.dp)
                    )
                }

                // Forward 5s
                IconButton(
                    onClick = {
                        currentProgress = (currentProgress + (5f / totalDurationSeconds)).coerceAtMost(1f)
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.Forward5,
                        contentDescription = "Forward 5s",
                        tint = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // 6. Scene Chapter Jump Pills
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                LectureScene.values().forEach { scene ->
                    val isCurrent = (scene == activeScene)
                    val targetProgress = when (scene) {
                        LectureScene.PROBLEM_OVERVIEW -> 0.05f
                        LectureScene.INTUITION -> 0.35f
                        LectureScene.SIMULATION -> 0.65f
                        LectureScene.COMPLEXITY -> 0.90f
                    }
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(
                                if (isCurrent) MaterialTheme.colorScheme.primary.copy(alpha = 0.25f)
                                else Color(0xFF1E293B)
                            )
                            .border(
                                1.dp,
                                if (isCurrent) MaterialTheme.colorScheme.primary else Color.Transparent,
                                RoundedCornerShape(8.dp)
                            )
                            .clickable {
                                currentProgress = targetProgress
                                isPlaying = true
                            }
                            .padding(vertical = 6.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = scene.title.substringBefore("."),
                            fontSize = 10.sp,
                            fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Normal,
                            color = if (isCurrent) Color.White else Color.Gray
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun LectureProblemScene(problemTitle: String, pulseScale: Float) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "CHAPTER 1: PROBLEM DECONSTRUCTION",
                color = Color(0xFF38BDF8), // Sky blue chalk
                fontWeight = FontWeight.Black,
                fontSize = 11.sp,
                letterSpacing = 1.sp
            )
            Surface(
                color = Color(0x3310B981),
                shape = RoundedCornerShape(4.dp)
            ) {
                Text(
                    text = "GIVEN INPUTS",
                    fontSize = 9.sp,
                    color = Color(0xFF34D399),
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }
        }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Array / Sequence Representation",
                fontSize = 11.sp,
                color = Color.LightGray
            )
            Spacer(modifier = Modifier.height(6.dp))

            // Animated array visualization
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                val demoElements = listOf("2", "7", "11", "15")
                demoElements.forEachIndexed { index, item ->
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(6.dp))
                            .background(if (index <= 1) Color(0xFF1E3A8A) else Color(0xFF1F2937))
                            .border(
                                1.dp,
                                if (index <= 1) Color(0xFF60A5FA) else Color(0xFF4B5563),
                                RoundedCornerShape(6.dp)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = item,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Indices: 0, 1, 2, 3 • Target Sum = 9",
                fontFamily = FontFamily.Monospace,
                fontSize = 10.sp,
                color = Color(0xFFFBBF24)
            )
        }

        Surface(
            color = Color(0x22FFFFFF),
            shape = RoundedCornerShape(6.dp)
        ) {
            Text(
                text = "Objective: Return exact matching indices without using same element twice.",
                fontSize = 10.sp,
                color = Color.White.copy(alpha = 0.85f),
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
        }
    }
}

@Composable
private fun LectureIntuitionScene(topic: String, pulseScale: Float) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = "CHAPTER 2: CORE INTUITION & STRATEGY",
            color = Color(0xFFA78BFA), // Purple chalk
            fontWeight = FontWeight.Black,
            fontSize = 11.sp,
            letterSpacing = 1.sp
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Naive approach card
            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = Color(0x22EF4444)),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFEF4444).copy(alpha = 0.5f))
            ) {
                Column(modifier = Modifier.padding(8.dp)) {
                    Text("❌ BRUTE FORCE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFFF87171))
                    Spacer(modifier = Modifier.height(2.dp))
                    Text("Nested loop O(N²)", fontSize = 9.sp, color = Color.White.copy(alpha = 0.8f))
                    Text("Exceeds Time Limit on 10⁵ inputs!", fontSize = 8.sp, color = Color.LightGray)
                }
            }

            // Optimal approach card
            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = Color(0x2210B981)),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF10B981).copy(alpha = 0.5f))
            ) {
                Column(modifier = Modifier.padding(8.dp)) {
                    Text("✨ OPTIMAL HASHING", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF34D399))
                    Spacer(modifier = Modifier.height(2.dp))
                    Text("Single pass O(N)", fontSize = 9.sp, color = Color.White.copy(alpha = 0.8f))
                    Text("Lookup complement in O(1) time!", fontSize = 8.sp, color = Color.LightGray)
                }
            }
        }

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(6.dp))
                .background(Color(0xFF1E1B4B))
                .padding(horizontal = 8.dp, vertical = 6.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Key Formula: Complement = Target - Current_Num",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 11.sp,
                color = Color(0xFFFDE047)
            )
        }
    }
}

@Composable
private fun LectureSimulationScene(progress: Float) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "CHAPTER 3: LIVE ALGORITHM SIMULATION",
                color = Color(0xFFF59E0B), // Amber chalk
                fontWeight = FontWeight.Black,
                fontSize = 11.sp,
                letterSpacing = 1.sp
            )
            Text(
                text = "Step 2 of 2",
                color = Color.LightGray,
                fontSize = 10.sp
            )
        }

        // Animated state trace
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Scanning nums[1] = 7",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Map: { 2: idx 0 }",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    color = Color(0xFF38BDF8)
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            LinearProgressIndicator(
                progress = { 0.85f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(4.dp)
                    .clip(CircleShape),
                color = Color(0xFF10B981),
                trackColor = Color(0xFF374151)
            )

            Spacer(modifier = Modifier.height(6.dp))

            Surface(
                color = Color(0x3310B981),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = "Success",
                        tint = Color(0xFF34D399),
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Match Found! 9 - 7 = 2 exists at index 0. Result: [0, 1]",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }

        Text(
            text = "Active Pointer: i = 1 (current element) -> Found target complement.",
            fontSize = 9.sp,
            color = Color.LightGray
        )
    }
}

@Composable
private fun LectureComplexityScene(difficulty: String) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = "CHAPTER 4: COMPLEXITY & TAKEAWAYS",
            color = Color(0xFF10B981), // Green chalk
            fontWeight = FontWeight.Black,
            fontSize = 11.sp,
            letterSpacing = 1.sp
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Time Complexity Card
            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF3B82F6))
            ) {
                Column(
                    modifier = Modifier.padding(10.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("TIME COMPLEXITY", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF93C5FD))
                    Text("O(N)", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Color.White)
                    Text("Linear 1-pass", fontSize = 9.sp, color = Color.LightGray)
                }
            }

            // Space Complexity Card
            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFA855F7))
            ) {
                Column(
                    modifier = Modifier.padding(10.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("SPACE COMPLEXITY", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFFD8B4FE))
                    Text("O(N)", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Color.White)
                    Text("Hash map storage", fontSize = 9.sp, color = Color.LightGray)
                }
            }
        }

        Surface(
            color = Color(0xFF312E81),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "🎓 Interview Tip: Always state the tradeoff between time and space upfront!",
                fontSize = 10.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFFE0E7FF),
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
            )
        }
    }
}

private fun getSubtitleForScene(scene: LectureScene, title: String): String {
    return when (scene) {
        LectureScene.PROBLEM_OVERVIEW -> "Welcome students! In this lecture we break down '$title'. Notice our input constraints and exact return types."
        LectureScene.INTUITION -> "A naive double loop wastes time recalculating pairs. Instead, we use hash map lookup to check complements in O(1) instant time."
        LectureScene.SIMULATION -> "Watch our live pointer: we insert 2 into our table, then at 7 we calculate 9 minus 7 equals 2! Immediate match."
        LectureScene.COMPLEXITY -> "Master summary: O(N) time with O(N) auxiliary space. Keep this pattern handy for all two-pointer and sliding window questions."
    }
}
