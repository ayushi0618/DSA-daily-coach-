package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.features.ai_solution.AiSolutionScreen
import com.example.features.analytics.AnalyticsScreen
import com.example.features.chat.ChatScreen
import com.example.features.daily_problem.DailyProblemScreen
import com.example.features.home.HomeScreen
import com.example.features.profile.ProfileScreen
import com.example.features.providers.DsaViewModel
import com.example.features.revision.RevisionScreen
import com.example.features.settings.SettingsScreen
import com.example.ui.theme.MyApplicationTheme

@OptIn(ExperimentalMaterial3Api::class)
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val viewModel: DsaViewModel = viewModel()
            val isDark by viewModel.isDarkMode.collectAsState()

            MyApplicationTheme(darkTheme = isDark) {
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                // Determine if bottom navigation should be visible (only on primary hub tabs)
                val primaryRoutes = listOf("home", "daily_problem", "revision", "analytics", "profile")
                val isBottomBarVisible = currentRoute in primaryRoutes

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    topBar = {
                        // Custom standard Header Top Bar for simple hub views
                        if (isBottomBarVisible) {
                            CenterAlignedTopAppBar(
                                title = { Text("DSA Daily Coach", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge) },
                                actions = {
                                    IconButton(
                                        onClick = { navController.navigate("settings") },
                                        modifier = Modifier.testTag("settings_button")
                                    ) {
                                        Icon(imageVector = Icons.Default.Settings, contentDescription = "Settings")
                                    }
                                }
                            )
                        }
                    },
                    bottomBar = {
                        AnimatedVisibility(
                            visible = isBottomBarVisible,
                            enter = slideInVertically(initialOffsetY = { it }),
                            exit = slideOutVertically(targetOffsetY = { it })
                        ) {
                            NavigationBar(
                                modifier = Modifier.testTag("bottom_nav_bar")
                            ) {
                                NavigationBarItem(
                                    selected = currentRoute == "home",
                                    onClick = { navController.navigate("home") { popUpTo("home") { saveState = true }; launchSingleTop = true; restoreState = true } },
                                    icon = { Icon(imageVector = Icons.Default.Home, contentDescription = "Home Dashboard") },
                                    label = { Text("Home", fontSize = 11.sp) }
                                )
                                NavigationBarItem(
                                    selected = currentRoute == "daily_problem",
                                    onClick = { navController.navigate("daily_problem") { popUpTo("home") { saveState = true }; launchSingleTop = true; restoreState = true } },
                                    icon = { Icon(imageVector = Icons.Default.AutoAwesome, contentDescription = "Solve Coach") },
                                    label = { Text("Solve", fontSize = 11.sp) }
                                )
                                NavigationBarItem(
                                    selected = currentRoute == "revision",
                                    onClick = { navController.navigate("revision") { popUpTo("home") { saveState = true }; launchSingleTop = true; restoreState = true } },
                                    icon = { Icon(imageVector = Icons.Default.Cached, contentDescription = "Spaced Repetition") },
                                    label = { Text("Revision", fontSize = 11.sp) }
                                )
                                NavigationBarItem(
                                    selected = currentRoute == "analytics",
                                    onClick = { navController.navigate("analytics") { popUpTo("home") { saveState = true }; launchSingleTop = true; restoreState = true } },
                                    icon = { Icon(imageVector = Icons.Default.Analytics, contentDescription = "Stats Charts") },
                                    label = { Text("Metrics", fontSize = 11.sp) }
                                )
                                NavigationBarItem(
                                    selected = currentRoute == "profile",
                                    onClick = { navController.navigate("profile") { popUpTo("home") { saveState = true }; launchSingleTop = true; restoreState = true } },
                                    icon = { Icon(imageVector = Icons.Default.Person, contentDescription = "Profile Statistics") },
                                    label = { Text("Profile", fontSize = 11.sp) }
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = "home",
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        // 1. Home Dashboard
                        composable("home") {
                            HomeScreen(
                                viewModel = viewModel,
                                onNavigateToSolve = { navController.navigate("daily_problem") },
                                onNavigateToDoubt = { navController.navigate("chat") },
                                onNavigateToProblemDetails = { problemId, language ->
                                    navController.navigate("ai_solution/$problemId/$language")
                                }
                            )
                        }

                        // 2. Solve Page
                        composable("daily_problem") {
                            DailyProblemScreen(
                                viewModel = viewModel,
                                onNavigateToSolution = { problemId, language ->
                                    navController.navigate("ai_solution/$problemId/$language")
                                }
                            )
                        }

                        // 3. AI Generated Solution Screen (Dynamic route with arguments)
                        composable(
                            route = "ai_solution/{problemId}/{language}",
                            arguments = listOf(
                                navArgument("problemId") { type = NavType.StringType },
                                navArgument("language") { type = NavType.StringType }
                            )
                        ) { backStackEntry ->
                            val problemId = backStackEntry.arguments?.getString("problemId") ?: ""
                            val language = backStackEntry.arguments?.getString("language") ?: "Java"
                            AiSolutionScreen(
                                viewModel = viewModel,
                                problemId = problemId,
                                language = language,
                                onBack = {
                                    viewModel.clearSolutionState()
                                    navController.navigateUp()
                                }
                            )
                        }

                        // 4. Revision Spaced Repetition Panel
                        composable("revision") {
                            RevisionScreen(
                                viewModel = viewModel,
                                onNavigateToSolution = { problemId, language ->
                                    navController.navigate("ai_solution/$problemId/$language")
                                }
                            )
                        }

                        // 5. Performance Analytics
                        composable("analytics") {
                            AnalyticsScreen(viewModel = viewModel)
                        }

                        // 6. Student Profile
                        composable("profile") {
                            ProfileScreen(viewModel = viewModel)
                        }

                        // 7. Settings Details (Sub-view)
                        composable("settings") {
                            Scaffold(
                                topBar = {
                                    CenterAlignedTopAppBar(
                                        title = { Text("Settings", fontWeight = FontWeight.Bold) },
                                        navigationIcon = {
                                            IconButton(onClick = { navController.navigateUp() }) {
                                                Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                                            }
                                        }
                                    )
                                }
                            ) { settingsPadding ->
                                Surface(modifier = Modifier.padding(settingsPadding)) {
                                    SettingsScreen(viewModel = viewModel)
                                }
                            }
                        }

                        // 8. Doubt AI Chat Assistant
                        composable("chat") {
                            Scaffold(
                                topBar = {
                                    CenterAlignedTopAppBar(
                                        title = { Text("Doubts Assistant", fontWeight = FontWeight.Bold) },
                                        navigationIcon = {
                                            IconButton(onClick = { navController.navigateUp() }) {
                                                Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                                            }
                                        }
                                    )
                                }
                            ) { chatPadding ->
                                Surface(modifier = Modifier.padding(chatPadding)) {
                                    ChatScreen(viewModel = viewModel)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
