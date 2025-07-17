import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
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

function MatchDaysList(props: MatchDaysListProps) {
  const { onSelectMatchDay, selectedMatchDayId } = props;
  const { data: matchDays = [], isLoading, error } = useGetMatchDaysQuery();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File[]>>(
    {}
  );
  const [status, setStatus] = useState<Record<string, string>>({});

  const handleFileChange = (matchDayId: string, files: FileList | null) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [matchDayId]: files ? Array.from(files) : [],
    }));
  };

  const handleUpload = async (matchDayId: string) => {
    const files = selectedFiles[matchDayId];
    if (!files || files.length === 0) {
      setStatus((prev) => ({ ...prev, [matchDayId]: 'No files selected.' }));
      return;
    }
    setUploadingId(matchDayId);
    setStatus((prev) => ({ ...prev, [matchDayId]: 'Uploading...' }));
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setStatus((prev) => ({ ...prev, [matchDayId]: 'No auth token.' }));
        setUploadingId(null);
        return;
      }
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('csvFiles', file);
      });
      const response = await fetch(
        `http://localhost:5050/api/admin/upload-match-data/${matchDayId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (!response.ok) throw new Error('Upload failed');
      setStatus((prev) => ({ ...prev, [matchDayId]: '✅ Upload successful!' }));
    } catch (err) {
      setStatus((prev) => ({ ...prev, [matchDayId]: '❌ Upload failed.' }));
    } finally {
      setUploadingId(null);
    }
  };

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

            let statusLabel = 'upcoming';
            let statusColor = 'info.main';
            if (now >= startTime && now <= endTime) {
              statusLabel = 'ongoing';
              statusColor = 'success.main';
            } else if (now > endTime) {
              statusLabel = 'completed';
              statusColor = 'text.secondary';
            }

            return (
              <ListItem
                key={matchDay.id}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  mb: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  p: 2,
                  background:
                    selectedMatchDayId === matchDay.id ? '#f0f6ff' : '#fff',
                  boxShadow: selectedMatchDayId === matchDay.id ? 2 : 0,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
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
                      {statusLabel}
                    </Typography>
                  </Box>
                  <Button
                    size='small'
                    variant={
                      selectedMatchDayId === matchDay.id
                        ? 'contained'
                        : 'outlined'
                    }
                    color='primary'
                    onClick={() =>
                      onSelectMatchDay(matchDay.id, matchDay.title)
                    }
                  >
                    {selectedMatchDayId === matchDay.id ? 'Selected' : 'Select'}
                  </Button>
                </Box>
                <Box sx={{ mt: 1, mb: 1, width: '100%' }}>
                  <Typography variant='caption' color='text.secondary'>
                    Start: {startTime.toLocaleString()} | End:{' '}
                    {endTime.toLocaleString()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    width: '100%',
                  }}
                >
                  <input
                    type='file'
                    accept='.csv'
                    multiple
                    style={{ display: 'none' }}
                    id={`upload-csv-${matchDay.id}`}
                    onChange={(e) =>
                      handleFileChange(matchDay.id, e.target.files)
                    }
                  />
                  <label htmlFor={`upload-csv-${matchDay.id}`}>
                    <Button variant='outlined' size='small' component='span'>
                      Choose CSV(s)
                    </Button>
                  </label>
                  <Typography
                    variant='body2'
                    sx={{
                      ml: 1,
                      flex: 1,
                      color: selectedFiles[matchDay.id]?.length
                        ? 'text.primary'
                        : 'text.disabled',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {selectedFiles[matchDay.id]?.length
                      ? selectedFiles[matchDay.id].map((f) => f.name).join(', ')
                      : 'No files selected'}
                  </Typography>
                  <Button
                    size='small'
                    variant='contained'
                    color='success'
                    disabled={
                      uploadingId === matchDay.id ||
                      !selectedFiles[matchDay.id] ||
                      selectedFiles[matchDay.id].length === 0
                    }
                    onClick={() => handleUpload(matchDay.id)}
                  >
                    {uploadingId === matchDay.id ? 'Uploading...' : 'Upload'}
                  </Button>
                </Box>
                {status[matchDay.id] && (
                  <Typography
                    variant='caption'
                    sx={{
                      mt: 1,
                      color: status[matchDay.id].startsWith('✅')
                        ? 'green'
                        : status[matchDay.id].startsWith('❌')
                          ? 'red'
                          : 'text.secondary',
                    }}
                  >
                    {status[matchDay.id]}
                  </Typography>
                )}
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
  const [
    snapshotAllTeamRosters,
    { isLoading: isSnapshotting, error: snapshotError },
  ] = useSnapshotAllTeamRostersMutation();

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
        <Box>
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
              {isSnapshotting
                ? 'Snapshotting Rosters...'
                : 'Snapshot All Team Rosters'}
            </Button>
            {snapshotError && (
              <Alert severity='error' sx={{ mt: 2 }}>
                Failed to snapshot team rosters. Please try again.
              </Alert>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
}
