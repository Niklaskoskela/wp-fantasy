import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useGetTeamsWithScoresQuery } from '../../api/teamApi';

export function LeagueStandings() {
  const {
    data: teamsWithScores = [],
    isLoading,
    error,
  } = useGetTeamsWithScoresQuery();

  // Sort teams by total points (highest first)
  const sortedTeams = React.useMemo(() => {
    return [...teamsWithScores].sort((a, b) => b.totalPoints - a.totalPoints);
  }, [teamsWithScores]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mb: 2 }}>
        Failed to load league standings
      </Alert>
    );
  }

  if (sortedTeams.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant='h6' color='text.secondary'>
          No Teams Found
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Create some teams and play some match days to see league standings
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant='h5' gutterBottom>
        League Standings
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Position</TableCell>
              <TableCell>Team Name</TableCell>
              <TableCell align='center'>Players</TableCell>
              <TableCell align='center'>Captain</TableCell>
              <TableCell align='right'>Total Points</TableCell>
              <TableCell align='center'>Match Days</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTeams.map((team, index) => (
              <TableRow key={team.id}>
                <TableCell component='th' scope='row'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='h6' color='primary'>
                      {index + 1}
                    </Typography>
                    {index === 0 && (
                      <Chip label='🏆' size='small' color='warning' />
                    )}
                    {index === 1 && (
                      <Chip label='🥈' size='small' color='default' />
                    )}
                    {index === 2 && (
                      <Chip label='🥉' size='small' color='default' />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant='h6'>{team.teamName}</Typography>
                </TableCell>
                <TableCell align='center'>
                  <Chip
                    label={`${team.players.length}/6`}
                    size='small'
                    color={team.players.length === 6 ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align='center'>
                  {team.teamCaptain ? (
                    <Chip
                      label={team.teamCaptain.name}
                      size='small'
                      color='primary'
                    />
                  ) : (
                    <Chip label='No Captain' size='small' color='default' />
                  )}
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='h5' color='primary' fontWeight='bold'>
                    {team.totalPoints}
                  </Typography>
                </TableCell>
                <TableCell align='center'>
                  {team.matchDayScores.length > 0 ? (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant='body2'>
                          {team.matchDayScores.length} Match Days
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                          }}
                        >
                          {team.matchDayScores.map((matchDay) => (
                            <Box
                              key={matchDay.matchDayId}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1,
                                bgcolor: 'background.default',
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant='body2'>
                                {matchDay.matchDayTitle}
                              </Typography>
                              <Typography variant='body2' fontWeight='bold'>
                                {matchDay.points} pts
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      No scores yet
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <Typography variant='caption' color='text.secondary'>
          Total points are calculated across all match days. Click on "Match
          Days" to see per-match-day breakdown.
        </Typography>
      </Box>
    </Box>
  );
}
