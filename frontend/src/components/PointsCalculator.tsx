import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useLazyCalculatePointsQuery } from '../api/matchDayApi';
import { useGetTeamsQuery } from '../api/teamApi';

interface PointsCalculatorProps {
  matchDayId: string;
  matchDayTitle: string;
}

export function PointsCalculator({
  matchDayId,
  matchDayTitle,
}: PointsCalculatorProps) {
  const { data: teams = [] } = useGetTeamsQuery();
  const [calculatePoints, { data: pointsData, isLoading, error, isSuccess }] =
    useLazyCalculatePointsQuery();

  const handleCalculatePoints = () => {
    calculatePoints(matchDayId);
  };

  // Create a map of team IDs to team names for display
  const teamMap = React.useMemo(() => {
    const map: { [teamId: string]: string } = {};
    teams.forEach((team) => {
      map[team.id] = team.teamName;
    });
    return map;
  }, [teams]);

  // Sort points data by points (highest first)
  const sortedPointsData = React.useMemo(() => {
    if (!pointsData) return [];
    return [...pointsData].sort((a, b) => b.points - a.points);
  }, [pointsData]);

  return (
    <Paper sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant='h6'>Calculate Points - {matchDayTitle}</Typography>
        <Button
          variant='contained'
          color='secondary'
          onClick={handleCalculatePoints}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Calculating...' : 'Calculate Points'}
        </Button>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          Failed to calculate points for this match day
        </Alert>
      )}

      {isSuccess && pointsData && (
        <Box>
          <Typography variant='subtitle1' gutterBottom>
            Points Results for {matchDayTitle}
          </Typography>

          {sortedPointsData.length === 0 ? (
            <Alert severity='info'>
              No teams found or no stats recorded for this match day
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Team Name</TableCell>
                    <TableCell align='right'>Points</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedPointsData.map((teamPoints, index) => (
                    <TableRow key={teamPoints.teamId}>
                      <TableCell component='th' scope='row'>
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        {teamMap[teamPoints.teamId] ||
                          `Team ${teamPoints.teamId}`}
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='h6' color='primary'>
                          {teamPoints.points}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant='caption' color='text.secondary'>
              Scoring: Goals (5 pts), Assists (3 pts), Blocks (2 pts), Steals (2
              pts) | Captain gets double points
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
