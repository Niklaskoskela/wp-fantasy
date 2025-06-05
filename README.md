# Water Polo Fantasy League management SPA react app.

Tech: Typescript, React, React Router, Material UI
Backend: Node JS Express backend
DB: PostgreSQL with proper migrations

First scope is MVP product with ability to manage fantasy team on
localhost on a single computer for a single person.
Management means, updating teams, updating player stats and calculating teams points. Stats and score should be calculated on a matchday basis

Plan is to use proper best practices for development to create maintainable, updatable and testable code base.
Avoid using undefined values - try to use checks or default values when necessary, eg. when creating or fetching data

## Development Plan:

1. Figure out types for fantasy teams, matchdays
2. Create types
3. Create simple DB by initializing the PG data tables. Use the types as basis for the tables.
4. Setup backend routes and connect it to DB. Create tests for these actions.
5. Managing content:
  a. Creating clubs.
  b. Creating players. 
6. Managing teams: Creating a team. Then being able to pick or change players for the teams and select a captain. Team consists of 6 players, 1 goal keeper, 1 of these is the captain.
7. Manage match days:
  a. creating a match day with a title (post request with a title)
  b. update player stats for a given match day. (post request with match day id and updated stats)
  c. calculate points for all of the teams for the match day. (get request with match day id)
8. Seeing the results of the league: get endpoint to get all of the teams of the league. 
Create also a solid system wide test that creates teams -> creates two matchdays -> updates stats for match days -> calculates points based on these -> 

## Testing Plan

Create simple tests in the backend to make sure points are calculated correctly

