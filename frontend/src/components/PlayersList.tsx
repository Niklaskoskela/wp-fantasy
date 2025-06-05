import React from 'react';
import { useGetPlayersQuery, useGetPlayerQuery } from '../api/contentApi';
import { List, ListItem, Typography, Button } from '@mui/material';

export function PlayersList() {
  const { data: players, isLoading } = useGetPlayersQuery();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const { data: player } = useGetPlayerQuery(selectedId!, {
    skip: !selectedId,
  });

  return (
    <div>
      <Typography variant='h6'>Players</Typography>
      <List>
        {isLoading ? (
          <ListItem>Loading...</ListItem>
        ) : (
          players?.map((p) => (
            <ListItem key={p.id}>
              <Button onClick={() => setSelectedId(p.id)}>{p.name}</Button>
            </ListItem>
          ))
        )}
      </List>
      {player && (
        <div style={{ marginTop: 16 }}>
          <Typography variant='subtitle1'>Player Details</Typography>
          <Typography>ID: {player.id}</Typography>
          <Typography>Name: {player.name}</Typography>
          <Typography>Position: {player.position}</Typography>
          <Typography>Club: {player.club.name}</Typography>
        </div>
      )}
    </div>
  );
}
