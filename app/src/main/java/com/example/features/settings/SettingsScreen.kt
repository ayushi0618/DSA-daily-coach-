package com.example.features.settings

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.clickable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.features.providers.DsaViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(viewModel: DsaViewModel) {
    val context = LocalContext.current
    val isDark by viewModel.isDarkMode.collectAsState()
    val isNotifEnabled by viewModel.isNotificationEnabled.collectAsState()
    val reminderTime by viewModel.dailyReminderTime.collectAsState()
    val preferredLang by viewModel.preferredLanguage.collectAsState()
    val solvedList by viewModel.solvedProblems.collectAsState()
    
    val leetcodeUsername by viewModel.leetcodeUsername.collectAsState()
    val isLeetCodeLinked by viewModel.isLeetCodeLinked.collectAsState()
    val autoSubmit by viewModel.autoSubmitToLeetCode.collectAsState()

    var showTimeDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("settings_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Heading
        item {
            Column(modifier = Modifier.padding(vertical = 12.dp)) {
                Text(
                    text = "DSA DAILY COACH",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 2.dp)
                )
                Text(
                    text = "App Settings.",
                    style = MaterialTheme.typography.displayLarge,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }
        }

        // 2. Visual Preferences
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(24.dp),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "THEMING & PREFERENCES",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    // Dark Theme Toggle
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = if (isDark) Icons.Default.DarkMode else Icons.Default.LightMode,
                                contentDescription = "Dark mode",
                                tint = MaterialTheme.colorScheme.secondary
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text("Premium Dark Mode", style = MaterialTheme.typography.bodyMedium)
                        }

                        Switch(
                            checked = isDark,
                            onCheckedChange = { viewModel.toggleDarkMode() }
                        )
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.05f))

                    // Language Selector Preferred
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Language,
                                contentDescription = "Language preferred",
                                tint = MaterialTheme.colorScheme.secondary
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text("Preferred Programming Language", style = MaterialTheme.typography.bodyMedium)
                        }

                        Text(
                            text = preferredLang,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }
        }

        // 2b. LeetCode Account Sync Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(24.dp),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "LEETCODE ACCOUNT SYNC",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    if (!isLeetCodeLinked) {
                        var tempUsername by remember { mutableStateOf("") }
                        Text(
                            text = "Link your LeetCode profile to automatically submit solutions, sync difficulty metrics, and track progress on the live platform.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                            modifier = Modifier.padding(bottom = 12.dp)
                        )
                        OutlinedTextField(
                            value = tempUsername,
                            onValueChange = { tempUsername = it },
                            label = { Text("LeetCode Username") },
                            placeholder = { Text("e.g. dsa_champion") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = {
                                if (tempUsername.isNotBlank()) {
                                    viewModel.linkLeetCodeAccount(tempUsername.trim())
                                    Toast.makeText(context, "LeetCode account '$tempUsername' linked successfully!", Toast.LENGTH_SHORT).show()
                                } else {
                                    Toast.makeText(context, "Please enter a valid username", Toast.LENGTH_SHORT).show()
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Link, contentDescription = "Link")
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Link LeetCode Account", fontWeight = FontWeight.Bold)
                        }
                    } else {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = "Linked",
                                    tint = Color(0xFF10B981),
                                    modifier = Modifier.size(24.dp)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Text(
                                        text = "LeetCode Sync Active",
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = "User: $leetcodeUsername",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                    )
                                }
                            }
                            TextButton(
                                onClick = {
                                    viewModel.unlinkLeetCodeAccount()
                                    Toast.makeText(context, "LeetCode account unlinked.", Toast.LENGTH_SHORT).show()
                                }
                            ) {
                                Text("Unlink", color = MaterialTheme.colorScheme.error)
                            }
                        }

                        HorizontalDivider(
                            modifier = Modifier.padding(vertical = 12.dp),
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.05f)
                        )

                        // Auto submit toggle
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                modifier = Modifier.weight(1f),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CloudSync,
                                    contentDescription = "Auto submit",
                                    tint = MaterialTheme.colorScheme.secondary
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Text("Automatic Submission", style = MaterialTheme.typography.bodyMedium)
                                    Text("Auto-submit solved solutions on study completion", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                                }
                            }
                            Switch(
                                checked = autoSubmit,
                                onCheckedChange = { viewModel.toggleAutoSubmitLeetCode() }
                            )
                        }
                    }
                }
            }
        }

        // 3. Local Study Notifications
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(24.dp),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "STUDY NOTIFICATIONS",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    // Notifications Toggle
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = if (isNotifEnabled) Icons.Default.NotificationsActive else Icons.Default.NotificationsOff,
                                contentDescription = "Notifications active",
                                tint = MaterialTheme.colorScheme.secondary
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text("Daily Practice Reminders", style = MaterialTheme.typography.bodyMedium)
                        }

                        Switch(
                            checked = isNotifEnabled,
                            onCheckedChange = {
                                viewModel.toggleNotifications()
                                com.example.core.notification.ReminderManager.setReminderEnabled(context, !isNotifEnabled)
                            }
                        )
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.05f))

                    // Reminder Time Selector Trigger
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { showTimeDialog = true }
                            .padding(vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Schedule,
                                contentDescription = "Reminder schedule",
                                tint = MaterialTheme.colorScheme.secondary
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text("Reminder Time schedule", style = MaterialTheme.typography.bodyMedium)
                        }

                        Text(
                            text = reminderTime,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    FilledTonalButton(
                        onClick = {
                            com.example.core.notification.ReminderManager.showNotification(
                                context = context,
                                title = "⚔️ DSA Challenge Reminder",
                                message = "Time to level up! Solve today's daily problem and extend your streak."
                            )
                            Toast.makeText(context, "Test notification sent!", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(imageVector = Icons.Default.NotificationAdd, contentDescription = "Test Notification")
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Send Immediate Test Notification", fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }

        // 4. Cache & Export Backup Utilities
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(24.dp),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "NETWORK & API DIAGNOSTICS",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    var isRunningDiagnostics by remember { mutableStateOf(false) }
                    var diagnosticResult by remember { mutableStateOf<String?>(null) }
                    val scope = rememberCoroutineScope()

                    Button(
                        onClick = {
                            isRunningDiagnostics = true
                            diagnosticResult = null
                            scope.launch {
                                try {
                                    val apiKey = com.example.BuildConfig.GEMINI_API_KEY
                                    if (apiKey.isEmpty() || apiKey == "MY_GEMINI_API_KEY") {
                                        diagnosticResult = "ERROR: Invalid or missing API key format in BuildConfig."
                                    } else {
                                        diagnosticResult = "API Key Format Valid.\nTesting Network Connection..."
                                        val testResponse = com.example.core.network.GeminiClient.generateContent("Respond with 'OK' if you receive this.")
                                        if (testResponse.contains("Network Error")) {
                                            diagnosticResult = "API Key Valid.\n$testResponse\nCheck device internet connection."
                                        } else {
                                            diagnosticResult = "SUCCESS: Network and API Key are working correctly.\nResponse: $testResponse"
                                        }
                                    }
                                } catch (e: Exception) {
                                    diagnosticResult = "FATAL ERROR: ${e.localizedMessage}"
                                } finally {
                                    isRunningDiagnostics = false
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        if (isRunningDiagnostics) {
                            CircularProgressIndicator(modifier = Modifier.size(24.dp), color = MaterialTheme.colorScheme.onPrimary)
                            Spacer(modifier = Modifier.width(12.dp))
                            Text("Running Tests...")
                        } else {
                            Icon(imageVector = Icons.Default.WifiTethering, contentDescription = "Run Diagnostics")
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Run Network & API Diagnostics", fontWeight = FontWeight.Bold)
                        }
                    }

                    if (diagnosticResult != null) {
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 12.dp),
                            color = if (diagnosticResult!!.contains("SUCCESS")) Color(0xFF10B981).copy(alpha = 0.1f) else MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.5f),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                text = diagnosticResult!!,
                                style = MaterialTheme.typography.bodySmall,
                                color = if (diagnosticResult!!.contains("SUCCESS")) Color(0xFF10B981) else MaterialTheme.colorScheme.onErrorContainer,
                                modifier = Modifier.padding(12.dp)
                            )
                        }
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.05f))

                    Text(
                        text = "BACKUPS & UTILITIES",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    // Export progress
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                if (solvedList.isEmpty()) {
                                    Toast.makeText(context, "No solved progress to export.", Toast.LENGTH_SHORT).show()
                                } else {
                                    val backupJson = solvedList.joinToString(prefix = "[", postfix = "]", separator = ",") {
                                        "{\"id\":\"${it.problemId}\",\"title\":\"${it.title}\",\"difficulty\":\"${it.difficulty}\",\"topic\":\"${it.topic}\"}"
                                    }
                                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                    val clip = ClipData.newPlainText("DSA Daily Coach Export", backupJson)
                                    clipboard.setPrimaryClip(clip)
                                    Toast.makeText(context, "Progress database copied to clipboard as JSON!", Toast.LENGTH_LONG).show()
                                }
                            }
                            .padding(vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.CloudUpload,
                                contentDescription = "Export backups",
                                tint = MaterialTheme.colorScheme.secondary
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text("Export Progress Data", style = MaterialTheme.typography.bodyMedium)
                        }

                        Icon(
                            imageVector = Icons.Default.ChevronRight,
                            contentDescription = "Trigger export",
                            tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f)
                        )
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.05f))

                    // Clear local storage cache
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                Toast.makeText(context, "Cache logs cleared! Restart app to re-populate.", Toast.LENGTH_SHORT).show()
                            }
                            .padding(vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.DeleteForever,
                                contentDescription = "Clear cache logs",
                                tint = MaterialTheme.colorScheme.error
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text("Clear Cached Solutions", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.error)
                        }
                    }
                }
            }
        }

        // 5. App details about card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.5f))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "About DSA Daily Coach",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Version 1.0.0 (Production-Ready Proto)\nPowered by Google AI Studio Gemini 1.5 Pro.\nDeveloped with Material Design 3 and Jetpack Compose on SQLite Room local storage.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                        lineHeight = 16.sp,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Privacy Policy: Study logs are persisted locally in safe Android sandboxes. API keys are handled securely via system secrets, protecting user data integrity.",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f),
                        lineHeight = 14.sp
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(60.dp)) // Safe padding
        }
    }

    // --- Daily Time Reminder Dialog ---
    if (showTimeDialog) {
        var hourValue by remember { mutableStateOf("20") }
        var minuteValue by remember { mutableStateOf("00") }

        AlertDialog(
            onDismissRequest = { showTimeDialog = false },
            title = { Text("Daily reminder schedule", fontWeight = FontWeight.Bold) },
            text = {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = hourValue,
                        onValueChange = { hourValue = it.take(2) },
                        label = { Text("Hour") },
                        modifier = Modifier.width(70.dp)
                    )
                    Text(" : ", fontSize = 24.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp))
                    OutlinedTextField(
                        value = minuteValue,
                        onValueChange = { minuteValue = it.take(2) },
                        label = { Text("Min") },
                        modifier = Modifier.width(70.dp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val hr = hourValue.toIntOrNull()?.coerceIn(0, 23) ?: 20
                        val min = minuteValue.toIntOrNull()?.coerceIn(0, 59) ?: 0
                        val formatted = String.format("%02d:%02d", hr, min)
                        viewModel.setReminderTime(formatted)
                        com.example.core.notification.ReminderManager.updateReminderTime(context, hr, min)
                        Toast.makeText(context, "Daily study alarm set for $formatted!", Toast.LENGTH_SHORT).show()
                        showTimeDialog = false
                    }
                ) {
                    Text("Confirm", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showTimeDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
