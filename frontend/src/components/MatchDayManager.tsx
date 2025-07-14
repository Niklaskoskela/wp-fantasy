import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Alert,
} from '@mui/material';
import {
  useGetMatchDaysQuery,
  useCreateMatchDayMutation,
} from '../api/matchDayApi';
import { useSnapshotAllTeamRostersMutation } from '../api/rosterHistoryApi';

interface MatchDaysListProps {
  onSelectMatchDay: (matchDayId: string, title: string) => void;
  selectedMatchDayId?: string;
}

export function MatchDaysList({
  onSelectMatchDay,
  selectedMatchDayId,
}: MatchDaysListProps) {
  const { data: matchDays = [], isLoading, error } = useGetMatchDaysQuery();

  if (isLoading) return <Typography>Loading match days...</Typography>;
  if (error) return <Alert severity='error'>Failed to load match days</Alert>;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant='h6' gutterBottom>
        Match Days
      </Typography>
      {matchDays.length === 0 ? (
        <Typography variant='body2' color='text.secondary'>
          No match days created yet
        </Typography>
      ) : (
        <List>
          <Typography variant='subtitle1' gutterBottom>
            Select Match Day:
          </Typography>
          {matchDays.map((matchDay) => {
            const now = new Date();
            const startTime = new Date(matchDay.startTime);
            const endTime = new Date(matchDay.endTime);

            let status = 'upcoming';
            let statusColor = 'info.main';

            if (now >= startTime && now <= endTime) {
              status = 'ongoing';
              statusColor = 'success.main';
            } else if (now > endTime) {
              status = 'completed';
              statusColor = 'text.secondary';
            }

            return (
              <ListItem key={matchDay.id} disablePadding>
                <ListItemButton
                  selected={selectedMatchDayId === matchDay.id}
                  onClick={() => onSelectMatchDay(matchDay.id, matchDay.title)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    border: selectedMatchDayId === matchDay.id ? 2 : 1,
                    borderColor:
                      selectedMatchDayId === matchDay.id
                        ? 'primary.main'
                        : 'divider',
                  }}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography variant='subtitle1'>
                          {matchDay.title}
                        </Typography>
                        <Typography
                          variant='caption'
                          sx={{
                            color: statusColor,
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                          }}
                        >
                          {status}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant='caption'
                          display='block'
                          color='text.secondary'
                        >
                          Start: {startTime.toLocaleString()}
                        </Typography>
                        <Typography
                          variant='caption'
                          display='block'
                          color='text.secondary'
                        >
                          End: {endTime.toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}
    </Paper>
  );
}

export function CreateMatchDayForm() {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [createMatchDay, { isLoading, error }] = useCreateMatchDayMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;

    try {
      await createMatchDay({
        title: title.trim(),
        startTime,
        endTime,
      }).unwrap();
      setTitle('');
      setStartTime('');
      setEndTime('');
    } catch (err) {
      console.error('Failed to create match day:', err);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant='h6' gutterBottom>
        Create New Match Day
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label='Match Day Title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            size='small'
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label='Start Time'
              type='datetime-local'
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              fullWidth
              size='small'
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label='End Time'
              type='datetime-local'
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              fullWidth
              size='small'
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
          <Button
            type='submit'
            variant='contained'
            disabled={isLoading || !title.trim() || !startTime || !endTime}
          >
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </Box>
        {error && (
          <Alert severity='error' sx={{ mt: 2 }}>
            Failed to create match day. Please check all fields are filled
            correctly.
          </Alert>
        )}
      </form>
    </Paper>
  );
}

interface MatchDayManagerProps {
  onSelectMatchDay: (matchDayId: string, title: string) => void;
  selectedMatchDayId?: string;
}

export function MatchDayManager({
  onSelectMatchDay,
  selectedMatchDayId,
}: MatchDayManagerProps) {
  const [snapshotAllTeamRosters, { isLoading: isSnapshotting, error: snapshotError }] = useSnapshotAllTeamRostersMutation();
  
  const handleSnapshotRosters = async () => {
    if (!selectedMatchDayId) return;
    
    try {
      await snapshotAllTeamRosters(selectedMatchDayId).unwrap();
    } catch (err) {
      console.error('Failed to snapshot team rosters:', err);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CreateMatchDayForm />
      <MatchDaysList
        onSelectMatchDay={onSelectMatchDay}
        selectedMatchDayId={selectedMatchDayId}
      />
      
      {selectedMatchDayId && (
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6' gutterBottom>
            Match Day Actions
          </Typography>
          <Button
            variant='contained'
            color='primary'
            onClick={handleSnapshotRosters}
            disabled={isSnapshotting}
            fullWidth
          >
            {isSnapshotting ? 'Snapshotting Rosters...' : 'Snapshot All Team Rosters'}
          </Button>
          {snapshotError && (
            <Alert severity='error' sx={{ mt: 2 }}>
              Failed to snapshot team rosters. Please try again.
            </Alert>
          )}
        </Paper>
      )}
    </Box>
  );
}
