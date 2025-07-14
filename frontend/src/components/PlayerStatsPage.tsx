import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useGetMatchDaysQuery } from '../api/matchDayApi';
import { useGetPlayersWithStatsQuery } from '../api/contentApi';
import { PlayerWithStats } from '../../../shared/src/types';

export function PlayerStatsPage() {
  const [selectedMatchDayId, setSelectedMatchDayId] = useState<string>('total');
  
  const { data: matchDays = [], isLoading: isLoadingMatchDays } = useGetMatchDaysQuery();
  const { 
    data: playersWithStats = [], 
    isLoading: isLoadingStats, 
    error 
  } = useGetPlayersWithStatsQuery({ 
    matchDayId: selectedMatchDayId === 'total' ? undefined : selectedMatchDayId 
  });

  const handleMatchDayChange = (event: any) => {
    setSelectedMatchDayId(event.target.value as string);
  };

  // Define columns for the DataGrid
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'rank',
      headerName: 'Rank',
      width: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="h6" color="primary" fontWeight="bold">
          #{params.value}
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: 'Player',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="subtitle1" fontWeight="bold">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'position',
      headerName: 'Position',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value} 
          color={params.value === 'goalkeeper' ? 'secondary' : 'primary'}
          size="small"
        />
      ),
    },
    {
      field: 'clubName',
      headerName: 'Club',
      width: 150,
    },
    {
      field: 'totalPoints',
      headerName: 'Total Points',
      width: 130,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="h6" color="primary" fontWeight="bold">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'goals',
      headerName: 'Goals',
      width: 80,
      type: 'number',
    },
    {
      field: 'assists',
      headerName: 'Assists',
      width: 80,
      type: 'number',
    },
    {
      field: 'blocks',
      headerName: 'Blocks',
      width: 80,
      type: 'number',
    },
    {
      field: 'steals',
      headerName: 'Steals',
      width: 80,
      type: 'number',
    },
    {
      field: 'pfDrawn',
      headerName: 'PF Drawn',
      width: 90,
      type: 'number',
    },
    {
      field: 'pf',
      headerName: 'PF',
      width: 70,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Typography color={params.value > 0 ? 'error.main' : 'inherit'}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'ballsLost',
      headerName: 'Balls Lost',
      width: 100,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Typography color={params.value > 0 ? 'error.main' : 'inherit'}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'contraFouls',
      headerName: 'Contra Fouls',
      width: 110,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Typography color={params.value > 0 ? 'error.main' : 'inherit'}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'shots',
      headerName: 'Shots',
      width: 80,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Typography color={params.value > 0 ? 'error.main' : 'inherit'}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'swimOffs',
      headerName: 'Swim Offs',
      width: 100,
      type: 'number',
    },
    {
      field: 'brutality',
      headerName: 'Brutality',
      width: 90,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Typography color={params.value > 0 ? 'error.main' : 'inherit'}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'saves',
      headerName: 'Saves',
      width: 80,
      type: 'number',
    },
    {
      field: 'wins',
      headerName: 'Wins',
      width: 80,
      type: 'number',
    },
  ], []);

  // Transform data for DataGrid
  const rows = useMemo(() => {
    const sortedPlayers = [...playersWithStats].sort((a, b) => b.totalPoints - a.totalPoints);
    
    return sortedPlayers.map((player, index) => ({
      id: player.id,
      rank: index + 1,
      name: player.name,
      position: player.position,
      clubName: player.club.name,
      totalPoints: player.totalPoints,
      goals: player.stats.goals,
      assists: player.stats.assists,
      blocks: player.stats.blocks,
      steals: player.stats.steals,
      pfDrawn: player.stats.pfDrawn,
      pf: player.stats.pf,
      ballsLost: player.stats.ballsLost,
      contraFouls: player.stats.contraFouls,
      shots: player.stats.shots,
      swimOffs: player.stats.swimOffs,
      brutality: player.stats.brutality,
      saves: player.stats.saves,
      wins: player.stats.wins,
    }));
  }, [playersWithStats]);

  if (isLoadingMatchDays || isLoadingStats) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load player statistics
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Player Statistics
      </Typography>
      
      <FormControl sx={{ minWidth: 250, mb: 3 }}>
        <InputLabel>Match Day</InputLabel>
        <Select
          value={selectedMatchDayId}
          label="Match Day"
          onChange={handleMatchDayChange}
        >
          <MenuItem value="total">Total Stats</MenuItem>
          {matchDays.map((matchDay) => (
            <MenuItem key={matchDay.id} value={matchDay.id}>
              {matchDay.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
          pageSizeOptions={[25, 50, 100]}
          checkboxSelection={false}
          disableRowSelectionOnClick
          density="compact"
          sx={{
            '& .MuiDataGrid-row:nth-of-type(odd)': {
              backgroundColor: 'action.hover',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.selected',
            },
          }}
        />
      </Box>

      {rows.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No player statistics available for the selected match day.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
