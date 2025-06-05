import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ClubsManager } from './components/ClubsManager';
import { PlayersManager } from './components/PlayersManager';
import { ClubsList } from './components/ClubsList';
import { PlayersList } from './components/PlayersList';
import { TeamsManager } from './components/TeamManager/TeamsManager';
import {
  AppBar,
  Toolbar,
  Button,
  Container,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
} from '@mui/material';
import { Menu } from '@mui/icons-material';
import { PageLayout } from './components/PageLayout';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Clubs', path: '/clubs' },
  { label: 'Players', path: '/players' },
  { label: 'Teams', path: '/teams' },
];

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
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  return (
    <Router>
      <AppBar position='static'>
        <Toolbar>
          <IconButton
            color='inherit'
            edge='start'
            sx={{ mr: 2, display: { sm: 'none' } }}
            onClick={handleDrawerToggle}
          >
            <Menu />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                color='inherit'
                component={Link}
                to={item.path}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor='left'
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{ display: { sm: 'none' } }}
      >
        <Box
          sx={{ width: 200 }}
          role='presentation'
          onClick={handleDrawerToggle}
        >
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton component={Link} to={item.path}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
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
          <Route path='/' element={<HomePage />} />
          <Route path='*' element={<HomePage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
