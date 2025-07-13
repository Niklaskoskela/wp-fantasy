import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ClubsManager } from './components/ClubsManager';
import { PlayersManager } from './components/PlayersManager';
import { ClubsList } from './components/ClubsList';
import { PlayersList } from './components/PlayersList';
import { TeamsManager } from './components/TeamManager/TeamsManager';
import { MatchDaysManager } from './components/MatchDaysManager';
import { NavigationBar } from './components/NavigationBar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthPage } from './components/AuthPage';
import { AdminUserManagement } from './components/AdminUserManagement';
import { AuthProvider } from './contexts/AuthContext';
import { Container, Typography, Box } from '@mui/material';
import { PageLayout } from './components/PageLayout';
import { useAuth } from './contexts/AuthContext';
import UploadsTab from './components/UploadsTab';
import PlayerStats from './components/PlayerStats';
import { PlayerStatsProvider } from './contexts/PlayerStatsContext';

function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant='h4' gutterBottom>
        Welcome to Water Polo Fantasy League!
      </Typography>
      {isAuthenticated ? (
        <Typography variant='body1'>
          Welcome back, <strong>{user?.username}</strong>! Manage your fantasy
          water polo league: create clubs, players, teams, match days, and see
          league results.
        </Typography>
      ) : (
        <Typography variant='body1'>
          Manage your fantasy water polo league: create clubs, players, teams,
          match days, and see league results.
        </Typography>
      )}
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <PlayerStatsProvider>
        <Router>
          <NavigationBar />
          <Container sx={{ mt: 4 }}>
            <Routes>
              <Route path='/auth' element={<AuthPage />} />
              <Route
                path='/clubs'
                element={
                  <ProtectedRoute requiresAdmin={true}>
                    <PageLayout>
                      <ClubsManager />
                      <ClubsList />
                    </PageLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/players'
                element={
                  <ProtectedRoute requiresAdmin={true}>
                    <PageLayout>
                      <PlayersManager />
                      <PlayersList />
                    </PageLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/teams'
                element={
                  <ProtectedRoute>
                    <PageLayout>
                      <TeamsManager />
                    </PageLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/home'
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/player-stats'
                element={
                  <ProtectedRoute>
                    <PlayerStats />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/matchdays'
                element={
                  <ProtectedRoute requiresAdmin={true}>
                    <PageLayout>
                      <MatchDaysManager />
                    </PageLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path='/admin/users'
                element={
                  <ProtectedRoute requiresAdmin={true}>
                    <AdminUserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/'
                element={
                  <ProtectedRoute>
                    <Navigate to='/teams' replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path='*'
                element={
                  <ProtectedRoute>
                    <Navigate to='/teams' replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/admin/uploads'
                element={
                  <ProtectedRoute requiresAdmin={true}>
                    <UploadsTab />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Container>
        </Router>
      </PlayerStatsProvider>
    </AuthProvider>
  );
}

export default App;
