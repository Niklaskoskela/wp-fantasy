import React from 'react';
import { useGetClubQuery } from '../api/contentApi';
import { Typography } from '@mui/material';

export function ClubDetails({ clubId }: { clubId: string }) {
  const { data: club, isLoading, error } = useGetClubQuery(clubId);

  if (isLoading) return <Typography>Loading club...</Typography>;
  if (error || !club) return <Typography>Club not found.</Typography>;

  return (
    <div>
      <Typography variant='h6'>Club Details</Typography>
      <Typography>ID: {club.id}</Typography>
      <Typography>Name: {club.name}</Typography>
    </div>
  );
}
