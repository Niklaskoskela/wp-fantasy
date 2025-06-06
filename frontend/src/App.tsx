import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClubsManager } from './components/ClubsManager';
import { PlayersManager } from './components/PlayersManager';
import { ClubsList } from './components/ClubsList';
import { PlayersList } from './components/PlayersList';
import { TeamsManager } from './components/TeamManager/TeamsManager';
import { MatchDaysManager } from './components/MatchDaysManager';
import { NavigationBar } from './components/NavigationBar';
import { Container, Typography, Box } from '@mui/material';
import { PageLayout } from './components/PageLayout';

function HomePage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant='h4' gutterBottom>
        Welcome to Water Polo Fantasy League!
      </Typography>
      <Typography variant='body1'>
        Manage your fantasy water polo league: create clubs, players, teams,
        match days, and see league results.
      </Typography>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <NavigationBar />
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route
            path='/clubs'
            element={
              <PageLayout>
                <ClubsManager />
                <ClubsList />
              </PageLayout>
            }
          />
          <Route
            path='/players'
            element={
              <PageLayout>
                <PlayersManager />
                <PlayersList />
              </PageLayout>
            }
          />
          <Route
            path='/teams'
            element={
              <PageLayout>
                <TeamsManager />
              </PageLayout>
            }
          />
          <Route
            path='/matchdays'
            element={
              <PageLayout>
                <MatchDaysManager />
              </PageLayout>
            }
          />
          <Route path='/' element={<HomePage />} />
          <Route path='*' element={<HomePage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
