import { useState } from 'react';
import { useGetClubsQuery, useCreateClubMutation } from '../api/contentApi';
import { Button, TextField, Typography } from '@mui/material';

export function ClubsManager() {
  useGetClubsQuery();
  const [createClub] = useCreateClubMutation();
  const [clubName, setClubName] = useState('');

  const handleCreate = async () => {
    if (clubName.trim()) {
      await createClub({ name: clubName });
      setClubName('');
    }
  };

  return (
    <div>
      <Typography variant='h5'>Clubs</Typography>
      <TextField
        label='New Club Name'
        value={clubName}
        onChange={(e) => setClubName(e.target.value)}
        size='small'
        sx={{ mr: 1 }}
      />
      <Button
        variant='contained'
        onClick={handleCreate}
        disabled={!clubName.trim()}
      >
        Create Club
      </Button>
    </div>
  );
}
