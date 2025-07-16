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
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useGetMatchDaysQuery } from '../api/matchDayApi';
import { useGetPlayersWithStatsQuery } from '../api/contentApi';
import { useGetTeamRosterHistoryQuery } from '../api/rosterHistoryApi';
import { useGetTeamsQuery } from '../api/teamApi';
import { PlayerWithStats, RosterHistory } from '../../../shared/src/types';
import { useAuth } from '../contexts/AuthContext';

export function PlayerStatsPage() {
  const [selectedMatchDayId, setSelectedMatchDayId] = useState<string>('total');
  const [tabValue, setTabValue] = useState(0);
  
  const { data: matchDays = [], isLoading: isLoadingMatchDays } = useGetMatchDaysQuery();
  const { data: teams = [] } = useGetTeamsQuery();
  const { user } = useAuth();
  
  // For simplicity, use the first team as "my team" (in real app, this would be user's team)
  const myTeam = teams.find(team => team.ownerId === user?.id);
  
  const { 
    data: playersWithStats = [], 
    isLoading: isLoadingStats, 
    error 
  } = useGetPlayersWithStatsQuery({ 
    matchDayId: selectedMatchDayId === 'total' ? undefined : selectedMatchDayId 
  });

  // Get roster history for my team
  const { 
    data: teamRosterHistory = {}, 
    isLoading: isLoadingRoster 
  } = useGetTeamRosterHistoryQuery(myTeam?.id || '', { skip: !myTeam });

  const handleMatchDayChange = (event: any) => {
    setSelectedMatchDayId(event.target.value as string);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  // Columns for roster stats tables (simplified view)
  const rosterColumns: GridColDef[] = useMemo(() => [
    {
      field: 'name',
      headerName: 'Player',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle1" fontWeight="bold">
            {params.value}
          </Typography>
          {params.row.isCaptain && (
            <Chip 
              label="C" 
              color="warning" 
              size="small" 
              sx={{ minWidth: 24, height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Box>
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
      headerName: 'Points',
      width: 100,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="h6" color="primary" fontWeight="bold">
          {params.value || 0}
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
      field: 'saves',
      headerName: 'Saves',
      width: 80,
      type: 'number',
    },
  ], []);

  // Transform roster data for each match day
  const rosterDataByMatchDay = useMemo(() => {
    if (!myTeam || !teamRosterHistory || !matchDays.length) return {};
    
    const result: { [matchDayId: string]: any[] } = {};
    
    // For each match day that has roster history
    Object.entries(teamRosterHistory).forEach(([matchDayId, rosterEntries]) => {
      const matchDay = matchDays.find(md => md.id === matchDayId);
      if (!matchDay) return;
      
      result[matchDayId] = rosterEntries.map((rosterEntry: RosterHistory) => ({
        id: rosterEntry.playerId,
        matchDayId: matchDayId,
        isCaptain: rosterEntry.isCaptain,
      }));
    });
    
    return result;
  }, [myTeam, teamRosterHistory, matchDays]);

  // Component to render a single match day roster with proper stats
  const MatchDayRosterTable = ({ matchDayId, rosterEntries }: { matchDayId: string, rosterEntries: any[] }) => {
    const matchDay = matchDays.find(md => md.id === matchDayId);
    
    // Fetch player stats specifically for this match day
    const { 
      data: matchDayPlayersWithStats = [], 
      isLoading: isLoadingMatchDayStats 
    } = useGetPlayersWithStatsQuery({ matchDayId });

    const rosterData = useMemo(() => {
      return rosterEntries.map((rosterEntry) => {
        // Find player stats for this specific match day
        const playerStatsForMatchDay = matchDayPlayersWithStats.find(p => 
          p.id === rosterEntry.id
        );
        
        if (playerStatsForMatchDay) {
          return {
            id: rosterEntry.id,
            name: playerStatsForMatchDay.name,
            position: playerStatsForMatchDay.position,
            clubName: playerStatsForMatchDay.club.name,
            isCaptain: rosterEntry.isCaptain,
            totalPoints: rosterEntry.isCaptain
                          ? (playerStatsForMatchDay.totalPoints || 0) * 2
                          : playerStatsForMatchDay.totalPoints || 0,
            goals: playerStatsForMatchDay.stats?.goals || 0,
            assists: playerStatsForMatchDay.stats?.assists || 0,
            blocks: playerStatsForMatchDay.stats?.blocks || 0,
            steals: playerStatsForMatchDay.stats?.steals || 0,
            saves: playerStatsForMatchDay.stats?.saves || 0,
          };
        } else {
          // Player not found in match day stats, show with zero stats
          return {
            id: rosterEntry.id,
            name: 'Player not found',
            position: 'unknown',
            clubName: 'Unknown',
            isCaptain: rosterEntry.isCaptain,
            totalPoints: 0,
            goals: 0,
            assists: 0,
            blocks: 0,
            steals: 0,
            saves: 0,
          };
        }
      }).sort((a, b) => b.totalPoints - a.totalPoints);
    }, [rosterEntries, matchDayPlayersWithStats]);

    const totalTeamPoints = rosterData.reduce((sum, player) => sum + (player.totalPoints || 0), 0);

    if (isLoadingMatchDayStats) {
      return (
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              {matchDay?.title || 'Unknown Match Day'}
            </Typography>
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={20} />
            </Box>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h3">
              {matchDay?.title || 'Unknown Match Day'}
            </Typography>
            <Chip 
              label={`Total: ${totalTeamPoints} pts`} 
              color="primary" 
              variant="outlined"
            />
          </Box>
          
          <Box sx={{ height: 300, width: '100%' }}>
            <DataGrid
              rows={rosterData}
              columns={rosterColumns}
              hideFooter
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
        </CardContent>
      </Card>
    );
  };

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
      
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="All Players" />
          <Tab label="My Roster Stats" disabled={!myTeam} />
        </Tabs>
      </Paper>
      
      {tabValue === 0 && (
        <>
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
        </>
      )}

      {tabValue === 1 && (
        <>
          {!myTeam ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No team found. Please create a team first to view roster statistics.
            </Alert>
          ) : isLoadingRoster ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                Roster Statistics for {myTeam.teamName}
              </Typography>
              
              {Object.keys(rosterDataByMatchDay).length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No roster history found for this team.
                </Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {Object.entries(rosterDataByMatchDay).map(([matchDayId, rosterEntries]) => (
                    <MatchDayRosterTable 
                      key={matchDayId}
                      matchDayId={matchDayId}
                      rosterEntries={rosterEntries}
                    />
                  ))}
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
}
