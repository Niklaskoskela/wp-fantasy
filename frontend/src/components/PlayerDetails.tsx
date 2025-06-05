import React from 'react';
import { useGetPlayerQuery } from '../api/contentApi';
import { Typography } from '@mui/material';

export function PlayerDetails({ playerId }: { playerId: string }) {
  const { data: player, isLoading, error } = useGetPlayerQuery(playerId);

  if (isLoading) return <Typography>Loading player...</Typography>;
  if (error || !player) return <Typography>Player not found.</Typography>;

  return (
    <div>
      <Typography variant='h6'>Player Details</Typography>
      <Typography>ID: {player.id}</Typography>
      <Typography>Name: {player.name}</Typography>
      <Typography>Position: {player.position}</Typography>
      <Typography>Club: {player.club.name}</Typography>
    </div>
  );
}
