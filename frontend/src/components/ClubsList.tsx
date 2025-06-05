import React from 'react';
import { useGetClubsQuery, useGetClubQuery } from '../api/contentApi';
import { List, ListItem, Typography, Button } from '@mui/material';

export function ClubsList() {
  const { data: clubs, isLoading } = useGetClubsQuery();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const { data: club } = useGetClubQuery(selectedId!, { skip: !selectedId });

  return (
    <div>
      <Typography variant='h6'>Clubs</Typography>
      <List>
        {isLoading ? (
          <ListItem>Loading...</ListItem>
        ) : (
          clubs?.map((c) => (
            <ListItem key={c.id}>
              <Button onClick={() => setSelectedId(c.id)}>{c.name}</Button>
            </ListItem>
          ))
        )}
      </List>
      {club && (
        <div style={{ marginTop: 16 }}>
          <Typography variant='subtitle1'>Club Details</Typography>
          <Typography>ID: {club.id}</Typography>
          <Typography>Name: {club.name}</Typography>
        </div>
      )}
    </div>
  );
}
