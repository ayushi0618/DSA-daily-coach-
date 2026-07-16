package com.example.core.database

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    @Query("SELECT * FROM users LIMIT 1")
    fun getUserFlow(): Flow<UserEntity?>

    @Query("SELECT * FROM users LIMIT 1")
    suspend fun getUserDirect(): UserEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)

    @Update
    suspend fun updateUser(user: UserEntity)

    @Query("DELETE FROM users")
    suspend fun clearUser()
}

@Dao
interface SolvedProblemDao {
    @Query("SELECT * FROM solved_problems ORDER BY solvedDate DESC")
    fun getAllProblemsFlow(): Flow<List<SolvedProblemEntity>>

    @Query("SELECT * FROM solved_problems WHERE problemId = :id")
    suspend fun getProblemById(id: String): SolvedProblemEntity?

    @Query("SELECT * FROM solved_problems WHERE problemId = :id")
    fun getProblemFlowById(id: String): Flow<SolvedProblemEntity?>

    @Query("SELECT * FROM solved_problems WHERE bookmarked = 1 OR favorite = 1")
    fun getBookmarksFlow(): Flow<List<SolvedProblemEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProblem(problem: SolvedProblemEntity)

    @Update
    suspend fun updateProblem(problem: SolvedProblemEntity)

    @Query("DELETE FROM solved_problems WHERE problemId = :id")
    suspend fun deleteProblemById(id: String)

    @Query("SELECT COUNT(*) FROM solved_problems")
    suspend fun getProblemsCount(): Int
}

@Dao
interface RevisionDao {
    @Query("SELECT * FROM revisions ORDER BY revisionDate DESC")
    fun getAllRevisionsFlow(): Flow<List<RevisionEntity>>

    @Query("SELECT * FROM revisions WHERE problemId = :problemId ORDER BY revisionDate DESC")
    fun getRevisionsForProblem(problemId: String): Flow<List<RevisionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRevision(revision: RevisionEntity)
}

@Dao
interface SearchHistoryDao {
    @Query("SELECT * FROM search_history ORDER BY timestamp DESC LIMIT 20")
    fun getRecentSearchHistoryFlow(): Flow<List<SearchHistoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSearch(query: SearchHistoryEntity)

    @Query("DELETE FROM search_history WHERE `query` = :query")
    suspend fun deleteSearch(query: String)

    @Query("DELETE FROM search_history")
    suspend fun clearHistory()
}
