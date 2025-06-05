import { useState } from 'react';
import { useGetPlayersQuery, useCreatePlayerMutation } from '../api/contentApi';
import {
  Button,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useGetClubsQuery } from '../api/contentApi';

export function PlayersManager() {
  useGetPlayersQuery();
  const { data: clubs } = useGetClubsQuery();
  const [createPlayer] = useCreatePlayerMutation();
  const [name, setName] = useState('');
  const [position, setPosition] = useState('field');
  const [clubId, setClubId] = useState('');

  const handleCreate = async () => {
    if (name.trim() && position && clubId) {
      await createPlayer({ name, position, clubId });
      setName('');
      setPosition('field');
      setClubId('');
    }
  };

  return (
    <div>
      <Typography variant='h5'>Players</Typography>
      <TextField
        label='Player Name'
        value={name}
        onChange={(e) => setName(e.target.value)}
        size='small'
        sx={{ mr: 1 }}
      />
      <FormControl size='small' sx={{ mr: 1, minWidth: 120 }}>
        <InputLabel>Position</InputLabel>
        <Select
          value={position}
          label='Position'
          onChange={(e) => setPosition(e.target.value)}
        >
          <MenuItem value='field'>Field</MenuItem>
          <MenuItem value='goalkeeper'>Goalkeeper</MenuItem>
        </Select>
      </FormControl>
      <FormControl size='small' sx={{ mr: 1, minWidth: 120 }}>
        <InputLabel>Club</InputLabel>
        <Select
          value={clubId}
          label='Club'
          onChange={(e) => setClubId(e.target.value)}
        >
          {clubs?.map((club) => (
            <MenuItem key={club.id} value={club.id}>
              {club.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant='contained'
        onClick={handleCreate}
        disabled={!name.trim() || !clubId}
      >
        Create Player
      </Button>
    </div>
  );
}
