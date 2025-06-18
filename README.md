# Water Polo Fantasy League management SPA react app.

Frontend: Vite, Typescript, React, React Router, Material UI
Backend: Node JS Express backend
DB: PostgreSQL with proper migrations

First scope is MVP product with ability to manage fantasy team on
localhost on a single computer for a single person.
Management means, updating teams, updating player stats and calculating teams points. Stats and score should be calculated on a matchday basis

Plan is to use proper best practices for development to create maintainable, updatable and testable code base.
Avoid using undefined values - try to use checks or default values when necessary, eg. when creating or fetching data

## Testing Plan

Create simple tests in the backend to make sure points are calculated correctly

## Development Plan:

### Backend

1. Figure out types for fantasy teams, matchdays
2. Create types
3. Create simple DB by initializing the PG data tables. Use the types as basis for the tables.
4. Setup backend routes and connect it to DB. Create tests for these actions.
5. Managing content:
  a. Creating / managing clubs. (post, put and delete request)
  b. Creating players. (post, put and delete request)
6. Managing teams: Creating a team. Then being able to pick or change players for the teams and select a captain. Team consists of 6 players, 1 goal keeper, 1 of these is the captain.
7. Manage match days:
  a. creating a match day with a title (post request with a title)
  b. update player stats for a given match day. (post request with match day id and updated stats)
  c. calculate points for all of the teams for the match day. (get request with match day id)
8. Seeing the results of the league: get endpoint to get all of the teams of the league. 
   Create also a solid system wide test that creates teams -> creates two matchdays -> updates stats for match days -> calculates points based on these -> 


### Frontend

Frontend with react and react-router, RTK query and MUI:
Use existing backend endpoints and shared types. Create components and divide into sub components based on functionality:
Setup react-router, RTK query and MUI (with a theme)
1. Managing content:
  a. Creating clubs.
  b. Creating players.
  c. Viewing list of clubs and a single club
  d. Viewing list of players and a single player
2. Managing teams: Creating a fantasy team by setting a title. Browsing players while being able to pick or change players for the teams and select a captain. Team consists of at most 6 players, 1 goal keeper, 1 of these is the captain.
3. Manage match days:
  a. creating a match day with a title
  b. when selecting a match day: update player stats for a given match day in a table view
  c. when selecting a match day, option to calculate points for all of the teams for the match day. (get request with match day id).
4. Seeing the results of the league. Get all of the teams, calculate total points and rank the teams 



### Users

Each user has 
* username, 
* email, 
* role, 
* password and a 
* single team

Management such as creating players, clubs and managing matchdays is done by admin level users

You will also need to create a usersession management. 

Possibility for admin to reset password


### Future development


Matchdays:
1. Should have start and ending times. 
2. Roster history: In database add a roster history --> store roster for each match day. Do this by properly making migrations
3. In backend: The active roster is added to the roster history, when the match day starts, for all the teams.
3. Team selector shows the next upcoming matchday and its start time. (or no if one does not exist)
4. Player selection for a team: players for a match day can be picked ONLY before match day start time.


----
Improve importing player data

Improve visuals

Player view should show player stats as well as all the matches player has played, as well as future matches.


