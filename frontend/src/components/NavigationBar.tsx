// filepath: /Users/nkoskela/Projects/wp-fantasy/frontend/src/components/NavigationBar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Typography,
} from '@mui/material';
import { Menu, Close, Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeContext, navMaxWidth } from '../theme';

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Clubs', path: '/clubs' },
  { label: 'Players', path: '/players' },
  { label: 'Teams', path: '/teams' },
  { label: 'Match Days', path: '/matchdays' },
];

export function NavigationBar() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const { isDarkMode, toggleTheme } = useThemeContext();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  return (
    <>
      <AppBar position='static'>
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: navMaxWidth,
              margin: '0 auto',
            }}
          >
            <Typography
              variant='h6'
              component='div'
              sx={{ flexGrow: 1, display: { xs: 'block', sm: 'none' } }}
            >
              WP Fantasy
            </Typography>

            <IconButton
              color='inherit'
              edge='start'
              sx={{ mr: 2, display: { sm: 'none' } }}
              onClick={handleDrawerToggle}
              aria-label='menu'
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
                  sx={{
                    mx: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            <IconButton
              color='inherit'
              onClick={toggleTheme}
              aria-label='toggle theme'
              sx={{ ml: 1 }}
            >
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor='left'
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { sm: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
          role='presentation'
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            }}
          >
            <Typography variant='h6' component='div'>
              Water Polo Fantasy
            </Typography>
            <IconButton onClick={handleDrawerToggle} aria-label='close menu'>
              <Close />
            </IconButton>
          </Box>

          <List sx={{ flexGrow: 1 }}>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={handleDrawerToggle}
                  sx={{
                    py: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '1.1rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}

            <ListItem disablePadding>
              <ListItemButton
                onClick={toggleTheme}
                sx={{
                  py: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemText
                  primary={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  primaryTypographyProps={{
                    fontSize: '1.1rem',
                    fontWeight: 500,
                  }}
                />
                {isDarkMode ? <Brightness7 /> : <Brightness4 />}
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
