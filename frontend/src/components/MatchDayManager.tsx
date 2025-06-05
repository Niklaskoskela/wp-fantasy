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
  Divider,
} from '@mui/material';
import {
  useGetMatchDaysQuery,
  useCreateMatchDayMutation,
} from '../api/matchDayApi';

interface MatchDaysListProps {
  onSelectMatchDay: (matchDayId: string, title: string) => void;
  selectedMatchDayId?: string;
}

export function MatchDaysList({ onSelectMatchDay, selectedMatchDayId }: MatchDaysListProps) {
  const { data: matchDays = [], isLoading, error } = useGetMatchDaysQuery();

  if (isLoading) return <Typography>Loading match days...</Typography>;
  if (error) return <Alert severity="error">Failed to load match days</Alert>;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Match Days
      </Typography>
      {matchDays.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No match days created yet
        </Typography>
      ) : (
        <List>
          {matchDays.map((matchDay) => (
            <ListItem key={matchDay.id} disablePadding>
              <ListItemButton
                selected={selectedMatchDayId === matchDay.id}
                onClick={() => onSelectMatchDay(matchDay.id, matchDay.title)}
              >
                <ListItemText
                  primary={matchDay.title}
                  secondary={`ID: ${matchDay.id}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}

export function CreateMatchDayForm() {
  const [title, setTitle] = useState('');
  const [createMatchDay, { isLoading, error }] = useCreateMatchDayMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createMatchDay({ title: title.trim() }).unwrap();
      setTitle('');
    } catch (err) {
      console.error('Failed to create match day:', err);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Create New Match Day
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Match Day Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !title.trim()}
          >
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to create match day
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

export function MatchDayManager({ onSelectMatchDay, selectedMatchDayId }: MatchDayManagerProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CreateMatchDayForm />
      <MatchDaysList 
        onSelectMatchDay={onSelectMatchDay}
        selectedMatchDayId={selectedMatchDayId}
      />
    </Box>
  );
}
