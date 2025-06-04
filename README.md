# Water Polo Fantasy League management SPA react app.

Tech: Typescript, React, React Router, Material UI
Backend: Node JS Express backend
DB: PostgreSQL with proper migrations

First scope is MVP product with ability to manage fantasy team on
local computer for a single person.

Plan is to use proper best practices for development to create maintainable, updatable and testable code base.
Avoid using undefined values - try to use checks or default values when necessary, eg. when creating or fetching data

## Development Plan:

1. Figure out types for fantasy teams, matchdays
2. Create types
3. Create simple DB by initializing the PG data tables. Use the types as basis for the tables.
3. Check with the DB and setup backend routes in this order:
3. Managing content:
  a. Creating pickable players.
  b. Creating clubs.
4. Managing teams: the option to update the water polo players in each of the fantasy teams
5. Manage match days:
  a. update stats of the players for a match day
  b. then calculate points for all of the teams
6. Option to view the Fantasy League's all teams total results

## Testing Plan

Create simple tests in the backend to make sure points are calculated correctly

