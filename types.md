Types:

Team:

players: Player[]
team name: String
score_history: MatchDay -> Number map

MatchDay:

number: Number
multiplier: Number

Player:

stats_history: matchday -> stats map
score_history matchday -> number map
name: String
captain: Boolean
position: field | goalkeeper

Stats:
Goals: Number
Assists: Number
Blocks: Number
Steals: Number
PF drawn: Number
PF: Number
BallsLost: Number
ContraFouls: Number
Shots: Number
SwimOffs: Number
Brutality: Number
Saves: Number
Wins: Number

(all stats should default to 0)
