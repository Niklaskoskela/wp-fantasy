import React from 'react';
import { AuthForm } from './AuthForm';
import { Box, Typography, Container } from '@mui/material';

export const AuthPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Water Polo Fantasy League
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Sign in to manage your fantasy team
        </Typography>
        <AuthForm />
      </Box>
    </Container>
  );
};
