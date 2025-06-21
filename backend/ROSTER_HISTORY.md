# Roster History Implementation

## Overview

The roster history feature tracks team compositions for each matchday, allowing the system to maintain a historical record of which players were on which teams for specific matchdays. This is essential for maintaining data integrity and ensuring that team changes don't affect historical scoring.

## Database Schema

### `roster_history` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Primary key |
| `team_id` | integer | Foreign key to teams table |
| `matchday_id` | integer | Foreign key to matchdays table |
| `player_id` | integer | Foreign key to players table |
| `is_captain` | boolean | Whether the player is the team captain |
| `created_at` | timestamp | When the roster entry was created |

### Constraints

- **Unique constraint**: `(team_id, matchday_id, player_id)` - Prevents duplicate entries
- **Captain constraint**: Only one captain per team per matchday (partial unique index)
- **Foreign key constraints**: Cascade deletion for referential integrity

## API Endpoints

### Create Roster History
```
POST /api/roster-history/:teamId/:matchDayId
Content-Type: application/json

[
  { "playerId": "player1", "isCaptain": true },
  { "playerId": "player2", "isCaptain": false },
  { "playerId": "player3", "isCaptain": false }
]
```

### Get Roster History
```
GET /api/roster-history/:teamId/:matchDayId
```

### Get Team Roster History
```
GET /api/roster-history/team/:teamId
```

### Get Matchday Roster History
```
GET /api/roster-history/matchday/:matchDayId
```

### Snapshot All Team Rosters
```
POST /api/roster-history/snapshot/:matchDayId
```

### Start Matchday (Auto-snapshot)
```
POST /api/matchdays/:id/start
```

### Check if Roster History Exists
```
GET /api/roster-history/check/:teamId/:matchDayId
```

### Remove Roster History
```
DELETE /api/roster-history/:teamId/:matchDayId
```

## Service Functions

### `rosterHistoryService.ts`

- `createRosterHistory(teamId, matchDayId, rosterEntries)` - Create roster history
- `getRosterHistory(teamId, matchDayId)` - Get specific roster history
- `getTeamRosterHistory(teamId)` - Get all roster history for a team
- `getMatchDayRosterHistory(matchDayId)` - Get all roster history for a matchday
- `removeRosterHistory(teamId, matchDayId)` - Remove roster history
- `hasRosterHistory(teamId, matchDayId)` - Check if roster history exists
- `snapshotAllTeamRosters(matchDayId)` - Snapshot all current team rosters

### `matchDayService.ts`

- `startMatchDay(matchDayId)` - Start a matchday and auto-snapshot rosters

## Usage Flow

1. **Team Management**: Teams can be modified freely before a matchday starts
2. **Matchday Start**: When `POST /api/matchdays/:id/start` is called:
   - System checks if matchday start time has been reached
   - Automatically snapshots all current team rosters
   - Prevents duplicate snapshotting
3. **Historical Integrity**: Roster history maintains team compositions for scoring calculations
4. **Roster Updates**: If needed before matchday starts, roster history can be updated or removed

## Example Usage

### Starting a Matchday
```javascript
// Start matchday (this automatically snapshots all team rosters)
const response = await fetch('/api/matchdays/123/start', {
  method: 'POST'
});
```

### Manual Roster Snapshot
```javascript
// Manually snapshot all team rosters for a matchday
const response = await fetch('/api/roster-history/snapshot/123', {
  method: 'POST'
});
```

### Getting Team Roster for Specific Matchday
```javascript
// Get roster history for team on specific matchday
const response = await fetch('/api/roster-history/team1/matchday1');
const rosterHistory = await response.json();
```

## Testing

The implementation includes comprehensive tests in `rosterHistory.test.ts` covering:
- Roster history creation
- Retrieval by team and matchday
- Automatic snapshotting
- Duplicate prevention
- Captain tracking
- Removal functionality

## Migration

Run the migration to create the roster_history table:
```bash
npm run migrate:dev
```

The migration file is: `1750532266808_add-roster-history.js`
