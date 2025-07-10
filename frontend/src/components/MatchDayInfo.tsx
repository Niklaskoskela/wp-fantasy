import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Skeleton,
} from '@mui/material';
import { MatchDay, RosterHistory } from '../../../shared/dist/types';
import { useGetPlayersQuery } from '../api/contentApi';

interface MatchDayInfoProps {
  matchDays: MatchDay[];
  isLoadingMatchDays: boolean;
  lastActiveRoster: RosterHistory[] | null;
  isLoadingRoster: boolean;
  teamName?: string;
}

export function MatchDayInfo({
  matchDays,
  isLoadingMatchDays,
  lastActiveRoster,
  isLoadingRoster,
  teamName = 'Your Team',
}: MatchDayInfoProps) {
  const { data: players = [] } = useGetPlayersQuery();

  // Find the next upcoming matchday
  const now = new Date();
  const upcomingMatchDays = matchDays
    .filter(md => new Date(md.startTime) > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  const nextMatchDay = upcomingMatchDays[0];

  // Find the last active (started) matchday
  const activeMatchDays = matchDays
    .filter(md => new Date(md.startTime) <= now)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  
  const lastActiveMatchDay = activeMatchDays[0];

  // Helper function to format date
  const formatDate = (date: Date | string) => {
    const dateObj = new Date(date);
    return {
      date: dateObj.toLocaleDateString(),
      time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Helper function to get player name by ID
  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player?.name || `Player ${playerId}`;
  };

  if (isLoadingMatchDays) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="rectangular" width="100%" height={100} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Next Upcoming Matchday */}
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Next Matchday
          </Typography>
          
          {nextMatchDay ? (
            <Box>
              <Typography variant="h5" gutterBottom>
                {nextMatchDay.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Starts: {formatDate(nextMatchDay.startTime).date} at {formatDate(nextMatchDay.startTime).time}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ends: {formatDate(nextMatchDay.endTime).date} at {formatDate(nextMatchDay.endTime).time}
              </Typography>
              
              {/* Time until start */}
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={`Starts in ${getTimeUntil(nextMatchDay.startTime)}`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Box>
          ) : (
            <Alert severity="info">
              No upcoming matchdays scheduled
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Last Active Matchday Roster */}
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="secondary">
            Last Active Roster
          </Typography>
          
          {lastActiveMatchDay && (
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              From: {lastActiveMatchDay.title}
            </Typography>
          )}

          {isLoadingRoster ? (
            <Box>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="70%" />
            </Box>
          ) : lastActiveRoster && lastActiveRoster.length > 0 ? (
            <List dense>
              {lastActiveRoster.map((rosterEntry) => (
                <ListItem key={rosterEntry.id} sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {getPlayerName(rosterEntry.playerId)}
                        </Typography>
                        {rosterEntry.isCaptain && (
                          <Chip 
                            label="Captain" 
                            size="small" 
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">
              {lastActiveMatchDay 
                ? 'No roster history found for the last active matchday'
                : 'No active matchdays yet'
              }
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

// Helper function to calculate time until a date
function getTimeUntil(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return 'Started';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}
