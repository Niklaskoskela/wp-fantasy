import React, { useState, useMemo } from 'react';
import {
  Button,
  TextField,
  Typography,
  List,
  Box,
  Stack,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { Player, PlayerPosition } from 'shared';
import { useGetPlayersQuery } from '../../api/contentApi';
import { useGetMatchDaysQuery } from '../../api/matchDayApi';
import { useCreateRosterHistoryMutation, useGetTeamRosterHistoryQuery } from '../../api/rosterHistoryApi';
import {
  useGetTeamsQuery,
  useCreateTeamMutation,
  useAddPlayerToTeamMutation,
  useRemovePlayerFromTeamMutation,
  useSetTeamCaptainMutation,
} from '../../api/teamApi';
import { PlayerPickerModal } from './PlayerPickerModal';
import { ErrorNotification } from './ErrorNotification';
import { TeamCard } from './TeamCard';
import { LeagueStandings } from './LeagueStandings';
import { MatchDayInfo } from '../MatchDayInfo';
import { useAuth } from '../../contexts/AuthContext';

export function TeamsManager() {
  const { data: teams = [], refetch } = useGetTeamsQuery();
  const { data: players = [] } = useGetPlayersQuery();
  const { data: matchDays = [], isLoading: isLoadingMatchDays } =
    useGetMatchDaysQuery();
  const { user } = useAuth();
  const [createRosterHistory] = useCreateRosterHistoryMutation();

  // Find the first team to show roster history for (or could be user's selected team)
  const firstTeam = teams[0];

  // Get roster history for the first team (in real app, this would be user's selected team)
  const { data: teamRosterHistory, isLoading: isLoadingRoster } =
    useGetTeamRosterHistoryQuery(firstTeam?.id || '', { skip: !firstTeam });

  // Find the last active matchday roster
  const lastActiveRoster = useMemo(() => {
    if (!teamRosterHistory || !matchDays.length) return null;

    const now = new Date();
    const activeMatchDays = matchDays
      .filter((md) => new Date(md.startTime) <= now)
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

    const lastActiveMatchDay = activeMatchDays[0];
    if (!lastActiveMatchDay) return null;

    return teamRosterHistory[lastActiveMatchDay.id] || null;
  }, [teamRosterHistory, matchDays]);

  const [createTeam] = useCreateTeamMutation();
  const [addPlayerToTeam] = useAddPlayerToTeamMutation();
  const [removePlayerFromTeam] = useRemovePlayerFromTeamMutation();
  const [setTeamCaptain] = useSetTeamCaptainMutation();

  const [activeTab, setActiveTab] = useState(0);
  const [newTeamName, setNewTeamName] = useState('');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSlot, setPickerSlot] = useState<{
    teamId: string;
    slot: number;
    position?: PlayerPosition;
  } | null>(null);
  const [pendingPlayers, setPendingPlayers] = useState<
    Record<string, (Player | null)[]>
  >({});
  const [pendingCaptain, setPendingCaptain] = useState<
    Record<string, string | undefined>
  >({});
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'error' | 'success' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'error',
  });
  const [savingTeamId, setSavingTeamId] = useState<string | null>(null);

  // Show notification
  const showNotification = (
    message: string,
    severity: 'error' | 'success' | 'info' | 'warning' = 'error'
  ) => {
    setNotification({ open: true, message, severity });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Create team
  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      showNotification('Please enter a team name', 'warning');
      return;
    }

    try {
      await createTeam({ teamName: newTeamName.trim() }).unwrap();
      setNewTeamName('');
      showNotification('Team created successfully!', 'success');
      refetch();
    } catch (error: any) {
      const message =
        error?.data?.error || error?.message || 'Failed to create team';
      showNotification(message, 'error');
    }
  };

  // Expand/collapse team
  const handleExpand = (teamId: string) => {
    const isExpanding = expandedTeamId !== teamId;
    setExpandedTeamId(isExpanding ? teamId : null);

    if (isExpanding && !pendingPlayers[teamId]) {
      const team = teams.find((t) => t.id === teamId);
      // Always 7 slots: 1 GK (slot 0), 6 outfield (slots 1-6)
      const slots: (Player | null)[] = Array(7).fill(null);
      if (team) {
        // Place goalkeeper in slot 0, outfield in slots 1-6
        const gk = team.players.find((p) => p.position === 'goalkeeper');
        const outfield = team.players.filter(
          (p) => p.position !== 'goalkeeper'
        );
        slots[0] = gk || null;
        for (let i = 0; i < 6; i++) {
          slots[i + 1] = outfield[i] || null;
        }
      }
      setPendingPlayers((prev) => ({
        ...prev,
        [teamId]: slots,
      }));
      setPendingCaptain((prev) => ({
        ...prev,
        [teamId]: team?.teamCaptain?.id,
      }));
    }
  };

  // Open player picker for a slot
  const handleOpenPicker = (teamId: string, slot: number) => {
    // Slot 0: GK, slots 1-6: field players (exclude goalkeepers)
    const requiredPosition = slot === 0 ? PlayerPosition.GOALKEEPER : undefined;
    setPickerSlot({ teamId, slot, position: requiredPosition });
    setPickerOpen(true);
  };

  // Pick a player for a slot
  const handlePickPlayer = (player: Player) => {
    if (!pickerSlot) return;
    const currentTeamPlayers = pendingPlayers[pickerSlot.teamId] || [];
    const isAlreadyPicked = currentTeamPlayers.some((p) => p?.id === player.id);
    if (isAlreadyPicked) {
      showNotification('This player is already in the team', 'warning');
      return;
    }
    setPendingPlayers((prev) => {
      const arr = prev[pickerSlot.teamId]
        ? [...prev[pickerSlot.teamId]]
        : Array(7).fill(null);
      arr[pickerSlot.slot] = player;
      return { ...prev, [pickerSlot.teamId]: arr };
    });
    setPickerSlot(null);
  };

  // Remove a player from a slot
  const handleRemovePlayer = (teamId: string, slot: number) => {
    setPendingPlayers((prev) => {
      const arr = prev[teamId] ? [...prev[teamId]] : Array(7).fill(null);
      const removedPlayer = arr[slot];
      arr[slot] = null;
      if (removedPlayer && pendingCaptain[teamId] === removedPlayer.id) {
        setPendingCaptain((prevCaptain) => ({
          ...prevCaptain,
          [teamId]: undefined,
        }));
      }
      return { ...prev, [teamId]: arr };
    });
  };

  // Set captain
  const handleSetCaptain = (teamId: string, playerId: string) => {
    setPendingCaptain((prev) => ({ ...prev, [teamId]: playerId }));
  };

  // Save team changes with improved error handling
  const handleSave = async (teamId: string) => {
    const playersArr = pendingPlayers[teamId] || [];
    const captainId = pendingCaptain[teamId];
    const now = new Date();
    const activeMatchDays = matchDays
      .filter((md) => new Date(md.startTime) <= now)
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

    const lastActiveMatchDay = activeMatchDays[0];
    if (!lastActiveMatchDay) return null;

    // Validation
    const validPlayers = playersArr.filter(Boolean);
    if (validPlayers.length === 0) {
      showNotification('Please add at least one player to the team', 'warning');
      return;
    }

    setSavingTeamId(teamId);

    try {
      const team = teams.find((t) => t.id === teamId);

      // Remove all existing players first
      if (team) {
        for (const p of team.players) {
          await removePlayerFromTeam({ teamId, playerId: p.id }).unwrap();
        }
      }

      // Add new players (slot 0: GK, 1-6: outfield)
      for (let i = 0; i < playersArr.length; i++) {
        const p = playersArr[i];
        if (p) {
          await addPlayerToTeam({ teamId, player: p }).unwrap();
        }
      }

      // Set captain if specified
      if (captainId) {
        await setTeamCaptain({ teamId, playerId: captainId }).unwrap();
      }

      await createRosterHistory({
        teamId,
        matchDayId: lastActiveMatchDay.id,
        rosterEntries: validPlayers.map((p) => ({
          playerId: p!.id,
          isCaptain: p!.id === captainId,
        })),
      }).unwrap();

      showNotification('Team saved successfully!', 'success');
      refetch();
    } catch (error: any) {
      const message =
        error?.data?.error || error?.message || 'Failed to save team';
      showNotification(message, 'error');
    } finally {
      setSavingTeamId(null);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        Teams
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label='Team Manager' />
          <Tab label='League Standings' />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Box>
          {/* Match Day Information */}
          <Box sx={{ mb: 4 }}>
            <MatchDayInfo
              matchDays={matchDays}
              isLoadingMatchDays={isLoadingMatchDays}
              lastActiveRoster={lastActiveRoster}
              isLoadingRoster={isLoadingRoster}
              teamName={firstTeam?.teamName}
            />
          </Box>

          {/* Create Team Section */}
          <Box
            sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}
          >
            <Typography variant='h6' gutterBottom>
              Create New Team
            </Typography>
            <Stack direction='row' spacing={2} alignItems='center'>
              <TextField
                label='Team Name'
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                size='small'
                sx={{ minWidth: 200 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleCreateTeam();
                }}
              />
              <Button
                variant='contained'
                onClick={handleCreateTeam}
                disabled={!newTeamName.trim()}
              >
                Create Team
              </Button>
            </Stack>
          </Box>

          {/* Teams List */}
          <Box>
            {/* Your Team Section */}
            <Typography variant='h6' gutterBottom>
              Your Team
            </Typography>
            {user && teams.filter((t) => t.ownerId === user.id).length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography color='text.secondary'>
                  You have not created a team yet. Create your team above!
                </Typography>
              </Box>
            ) : (
              <List
                sx={{
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  p: 2,
                  mb: 4,
                }}
              >
                {teams
                  .filter((t) => t.ownerId === user?.id)
                  .map((team) => {
                    const slots =
                      pendingPlayers[team.id] ||
                      (() => {
                        const arr = Array(7).fill(null);
                        const gk = team.players.find(
                          (p) => p.position === 'goalkeeper'
                        );
                        const outfield = team.players.filter(
                          (p) => p.position !== 'goalkeeper'
                        );
                        arr[0] = gk || null;
                        for (let i = 0; i < 6; i++)
                          arr[i + 1] = outfield[i] || null;
                        return arr;
                      })();
                    const captainId =
                      pendingCaptain[team.id] ?? team.teamCaptain?.id;
                    const canEdit =
                      user &&
                      (user.role === 'admin' || team.ownerId === user.id);
                    return (
                      <TeamCard
                        key={team.id}
                        team={team}
                        expanded={expandedTeamId === team.id}
                        slots={slots}
                        captainId={captainId}
                        onToggleExpand={() => handleExpand(team.id)}
                        onPickPlayer={(slot) =>
                          handleOpenPicker(team.id, slot)
                        }
                        onRemovePlayer={(slot) =>
                          handleRemovePlayer(team.id, slot)
                        }
                        onSetCaptain={(playerId) =>
                          handleSetCaptain(team.id, playerId)
                        }
                        onSave={() => handleSave(team.id)}
                        isSaving={savingTeamId === team.id}
                        canEdit={!!canEdit}
                      />
                    );
                  })}
              </List>
            )}

            {/* Other Teams Section */}
            <Typography variant='h6' gutterBottom>
              Other Teams ({teams.filter((t) => t.ownerId !== user?.id).length})
            </Typography>
            {teams.filter((t) => t.ownerId !== user?.id).length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography color='text.secondary'>
                  No other teams created yet.
                </Typography>
              </Box>
            ) : (
              <List
                sx={{ bgcolor: 'background.default', borderRadius: 2, p: 2 }}
              >
                {teams
                  .filter((t) => t.ownerId !== user?.id)
                  .map((team) => {
                    const slots =
                      pendingPlayers[team.id] ||
                      (() => {
                        const arr = Array(7).fill(null);
                        const gk = team.players.find(
                          (p) => p.position === 'goalkeeper'
                        );
                        const outfield = team.players.filter(
                          (p) => p.position !== 'goalkeeper'
                        );
                        arr[0] = gk || null;
                        for (let i = 0; i < 6; i++)
                          arr[i + 1] = outfield[i] || null;
                        return arr;
                      })();
                    const captainId =
                      pendingCaptain[team.id] ?? team.teamCaptain?.id;
                    const canEdit =
                      user &&
                      (user.role === 'admin' || team.ownerId === user.id);
                    return (
                      <TeamCard
                        key={team.id}
                        team={team}
                        expanded={expandedTeamId === team.id}
                        slots={slots}
                        captainId={captainId}
                        onToggleExpand={() => handleExpand(team.id)}
                        onPickPlayer={(slot) =>
                          handleOpenPicker(team.id, slot)
                        }
                        onRemovePlayer={(slot) =>
                          handleRemovePlayer(team.id, slot)
                        }
                        onSetCaptain={(playerId) =>
                          handleSetCaptain(team.id, playerId)
                        }
                        onSave={() => handleSave(team.id)}
                        isSaving={savingTeamId === team.id}
                        canEdit={!!canEdit}
                      />
                    );
                  })}
              </List>
            )}
          </Box>

          {/* Player Picker Modal */}
          <PlayerPickerModal
            open={pickerOpen}
            onClose={() => {
              setPickerOpen(false);
              setPickerSlot(null);
            }}
            onPick={handlePickPlayer}
            players={players}
            alreadyPickedIds={
              pickerSlot && pendingPlayers[pickerSlot.teamId]
                ? pendingPlayers[pickerSlot.teamId]
                    .filter(Boolean)
                    .map((p) => (p as Player).id)
                : []
            }
            requiredPosition={pickerSlot?.position}
          />
        </Box>
      )}

      {activeTab === 1 && <LeagueStandings />}

      {/* Error/Success Notifications */}
      <ErrorNotification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
}
