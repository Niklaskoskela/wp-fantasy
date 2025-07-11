import React, { useState } from 'react';
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
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { useGetPlayersQuery } from '../api/contentApi';
import {
  useUpdatePlayerStatsMutation,
  useGetPlayerStatsQuery,
} from '../api/matchDayApi';
import { Stats } from '../../../shared/dist/types';
import { v4 as uuidv4 } from 'uuid';

interface PlayerStatsUpdaterProps {
  matchDayId: string;
  matchDayTitle: string;
}

const defaultStats: Omit<Stats, 'id'> = {
  goals: 0,
  assists: 0,
  blocks: 0,
  steals: 0,
  pfDrawn: 0,
  pf: 0,
  ballsLost: 0,
  contraFouls: 0,
  shots: 0,
  swimOffs: 0,
  brutality: 0,
  saves: 0,
  wins: 0,
};

export function PlayerStatsUpdater({
  matchDayId,
  matchDayTitle,
}: PlayerStatsUpdaterProps) {
  const { data: players = [], isLoading, error } = useGetPlayersQuery();
  const { data: existingStats = {}, isLoading: isLoadingStats } =
    useGetPlayerStatsQuery(matchDayId);
  const [updatePlayerStats, { isLoading: isUpdating }] =
    useUpdatePlayerStatsMutation();
  const [playerStats, setPlayerStats] = useState<{ [playerId: string]: Stats }>(
    {}
  );
  const [updateResults, setUpdateResults] = useState<{
    success: string[];
    errors: string[];
  }>({
    success: [],
    errors: [],
  });

  // Initialize stats for all players if not already set
  React.useEffect(() => {
    if (players.length > 0 && !isLoadingStats) {
      const initialStats: { [playerId: string]: Stats } = {};
      players.forEach((player) => {
        if (!playerStats[player.id]) {
          // Use existing stats from API if available, otherwise use defaults
          const existingPlayerStats = existingStats[player.id];
          initialStats[player.id] = existingPlayerStats || {
            id: uuidv4(),
            ...defaultStats,
          };
        }
      });
      if (Object.keys(initialStats).length > 0) {
        setPlayerStats((prev) => ({ ...prev, ...initialStats }));
      }
    }
  }, [players, existingStats, isLoadingStats, playerStats]);

  const handleStatChange = (
    playerId: string,
    statKey: keyof Omit<Stats, 'id'>,
    value: number
  ) => {
    setPlayerStats((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [statKey]: value,
      },
    }));
  };

  const handleUpdatePlayerStats = async (playerId: string) => {
    try {
      const stats = playerStats[playerId];
      await updatePlayerStats({
        matchDayId,
        playerId,
        stats,
      }).unwrap();

      setUpdateResults((prev) => ({
        ...prev,
        success: [...prev.success.filter((id) => id !== playerId), playerId],
        errors: prev.errors.filter((id) => id !== playerId),
      }));
    } catch (err) {
      console.error('Failed to update player stats:', err);
      setUpdateResults((prev) => ({
        ...prev,
        errors: [...prev.errors.filter((id) => id !== playerId), playerId],
        success: prev.success.filter((id) => id !== playerId),
      }));
    }
  };

  const handleUpdateAllStats = async () => {
    const promises = players.map((player) =>
      updatePlayerStats({
        matchDayId,
        playerId: player.id,
        stats: playerStats[player.id],
      }).unwrap()
    );

    try {
      await Promise.all(promises);
      setUpdateResults({
        success: players.map((p) => p.id),
        errors: [],
      });
    } catch (err) {
      console.error('Failed to update some player stats:', err);
    }
  };

  if (isLoading || isLoadingStats)
    return <Typography>Loading players and stats...</Typography>;
  if (error) return <Alert severity='error'>Failed to load players</Alert>;

  const statsFields: Array<{
    key: keyof Omit<Stats, 'id'>;
    label: string;
    min: number;
  }> = [
    { key: 'goals', label: 'Goals', min: 0 },
    { key: 'assists', label: 'Assists', min: 0 },
    { key: 'blocks', label: 'Blocks', min: 0 },
    { key: 'steals', label: 'Steals', min: 0 },
    { key: 'saves', label: 'Saves', min: 0 },
    { key: 'shots', label: 'Shots', min: 0 },
    { key: 'pfDrawn', label: 'PF Drawn', min: 0 },
    { key: 'pf', label: 'PF', min: 0 },
    { key: 'ballsLost', label: 'Balls Lost', min: 0 },
    { key: 'contraFouls', label: 'Contra Fouls', min: 0 },
    { key: 'swimOffs', label: 'Swim Offs', min: 0 },
    { key: 'brutality', label: 'Brutality', min: 0 },
    { key: 'wins', label: 'Wins', min: 0 },
  ];

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
        <Typography variant='h6'>
          Update Player Stats - {matchDayTitle}
        </Typography>
        <Button
          variant='contained'
          color='primary'
          onClick={handleUpdateAllStats}
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : 'Update All Stats'}
        </Button>
      </Box>

      {updateResults.success.length > 0 && (
        <Alert severity='success' sx={{ mb: 2 }}>
          Successfully updated stats for {updateResults.success.length} players
        </Alert>
      )}

      {updateResults.errors.length > 0 && (
        <Alert severity='error' sx={{ mb: 2 }}>
          Failed to update stats for {updateResults.errors.length} players
        </Alert>
      )}

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Club</TableCell>
              {statsFields.map((field) => (
                <TableCell key={field.key} align='center'>
                  {field.label}
                </TableCell>
              ))}
              <TableCell align='center'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((player) => {
              const hasExistingStats = existingStats[player.id] !== undefined;
              return (
                <TableRow
                  key={player.id}
                  sx={{
                    backgroundColor: hasExistingStats
                      ? 'action.hover'
                      : 'transparent',
                  }}
                >
                  <TableCell component='th' scope='row'>
                    {player.name}
                    {hasExistingStats && (
                      <Typography
                        variant='caption'
                        color='primary'
                        sx={{ display: 'block', fontStyle: 'italic' }}
                      >
                        Has saved stats
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell>{player.club.name}</TableCell>
                  {statsFields.map((field) => (
                    <TableCell key={field.key} align='center'>
                      <TextField
                        type='number'
                        size='small'
                        value={playerStats[player.id]?.[field.key] || 0}
                        onChange={(e) =>
                          handleStatChange(
                            player.id,
                            field.key,
                            Math.max(field.min, parseInt(e.target.value) || 0)
                          )
                        }
                        inputProps={{ min: field.min, step: 1 }}
                        sx={{ width: 70 }}
                      />
                    </TableCell>
                  ))}
                  <TableCell align='center'>
                    <Button
                      size='small'
                      variant='outlined'
                      onClick={() => handleUpdatePlayerStats(player.id)}
                      disabled={isUpdating}
                      color={
                        updateResults.success.includes(player.id)
                          ? 'success'
                          : 'primary'
                      }
                    >
                      {updateResults.success.includes(player.id)
                        ? 'Updated'
                        : 'Update'}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
