# Performance Optimization for /api/teams/with-scores

## Issue
The `/api/teams/with-scores` endpoint was taking 15+ seconds to load, causing poor user experience in the league standings page.

## Root Cause Analysis
The original implementation had severe performance issues:

1. **Nested Loop Problem**: O(n²) complexity where for each team, it called `calculatePoints` for each match day
2. **Duplicate Database Queries**: `calculatePoints` was fetching all teams again for each match day
3. **Individual Player Queries**: For each player in each team, a separate database query was made to get stats
4. **No Caching**: Results were recalculated on every request

### Original Flow:
```
getTeamsWithScores() {
  teams = getTeams() // Query 1: Get all teams (with sub-queries for each team)
  matchDays = getMatchDays() // Query 2: Get all match days
  
  for each team: // N teams
    for each matchDay: // M match days  
      calculatePoints(matchDay) { // N*M calls
        teams = getTeams() // Query again! (N*M additional team queries)
        for each team:
          for each player: // P players
            getPlayerStats(player, matchDay) // N*M*P individual queries
          }
        }
      }
    }
  }
}
```

**Total Queries**: ~1 + 1 + N*M*(1 + N*P) = O(N²*M*P)

## Solution

### 1. Query Optimization
- **Single JOIN Query**: Get all teams, players, and club data in one optimized query
- **Batch Stats Query**: Get all player stats for all match days in one query using `WHERE matchday_id = ANY($1)`
- **Eliminated Nested Loops**: Process data in linear time O(N+M+P)

### 2. In-Memory Caching
- **5-minute cache**: Results are cached for 5 minutes to avoid recalculation
- **Smart Invalidation**: Cache is automatically invalidated when:
  - Player stats are updated
  - Players are added/removed from teams
  - Team captains are changed

### 3. Database Indexes
Added performance-critical indexes:
- `team_players(team_id)` - for team roster lookups
- `team_players(player_id)` - for player team lookups
- `players(club_id)` - for club information joins
- `users(team_id)` - for team ownership queries
- `player_stats(player_id, matchday_id)` - composite index for stats queries
- `player_stats(matchday_id)` - for batch stats queries
- `matchdays(start_time)` - for chronological ordering

### 4. New Optimized Flow:
```
getTeamsWithScores() {
  if (cached && cache_valid) return cache
  
  // Single optimized query gets all team data
  teamsData = query(`
    SELECT t.*, u.id as owner_id, p.*, c.*, tp.is_captain 
    FROM teams t 
    LEFT JOIN users u ON u.team_id = t.id
    LEFT JOIN team_players tp ON tp.team_id = t.id
    LEFT JOIN players p ON p.id = tp.player_id
    LEFT JOIN clubs c ON c.id = p.club_id
  `)
  
  // Single query gets all stats for all match days
  allStats = query(`
    SELECT * FROM player_stats 
    WHERE matchday_id = ANY($1)
  `, [matchDayIds])
  
  // Process in memory - linear time O(N+M+P)
  processResults(teamsData, allStats)
  
  cache = results
  return results
}
```

**Total Queries**: 3 queries total, regardless of data size

## Performance Impact

### Before:
- **Query Count**: ~100-1000+ queries depending on data size
- **Time Complexity**: O(N²*M*P) 
- **Response Time**: 15+ seconds
- **Database Load**: High with many individual queries

### After:
- **Query Count**: 3 queries total
- **Time Complexity**: O(N+M+P)
- **Expected Response Time**: <500ms (cached: <50ms)
- **Database Load**: Minimal with optimized queries

## Cache Management

### Cache Invalidation Endpoints:
- **POST /api/teams/clear-cache** - Admin only, manually clear cache
- **Automatic invalidation** when:
  - `updatePlayerStats()` is called
  - `addPlayerToTeam()` is called
  - `removePlayerFromTeam()` is called  
  - `setTeamCaptain()` is called

### Cache Settings:
- **Duration**: 5 minutes
- **Storage**: In-memory (per server instance)
- **Invalidation**: Smart invalidation on data changes

## Monitoring

The optimization includes:
- Database indexes for query performance
- In-memory caching with automatic invalidation
- Admin endpoint for cache management
- Preserved all existing functionality and API contracts

## Future Considerations

1. **Redis Cache**: For multiple server instances, consider Redis for shared caching
2. **Database Views**: Could create materialized views for even better performance
3. **Pagination**: If data grows very large, consider pagination
4. **Background Jobs**: Pre-calculate scores in background jobs
