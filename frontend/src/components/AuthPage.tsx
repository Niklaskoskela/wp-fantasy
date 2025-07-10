import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from './AuthForm';
import { Box, Typography, Container } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export const AuthPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to teams page
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/teams', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Don't render the auth form if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth='sm'>
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant='h3' component='h1' gutterBottom align='center'>
          Water Polo Fantasy League
        </Typography>
        <Typography
          variant='h6'
          color='text.secondary'
          align='center'
          sx={{ mb: 4 }}
        >
          Sign in to manage your fantasy team
        </Typography>
        <AuthForm />
      </Box>
    </Container>
  );
};
