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
  Menu,
  MenuItem,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close,
  Brightness4,
  Brightness7,
  Person,
  ExitToApp,
} from '@mui/icons-material';
import { useThemeContext, navMaxWidth } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { useLogoutMutation } from '../api/authApi';

interface NavItem {
  label: string;
  path: string;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Clubs', path: '/clubs', requireAuth: true, requireAdmin: true },
  { label: 'Players', path: '/players', requireAuth: true, requireAdmin: true },
  { label: 'Teams', path: '/teams', requireAuth: true },
  { label: 'Player Stats', path: '/player-stats', requireAuth: true },
  {
    label: 'Match Days',
    path: '/matchdays',
    requireAuth: true,
    requireAdmin: true,
  },
  {
    label: 'Budget Test',
    path: '/admin/budget-test',
    requireAuth: true,
    requireAdmin: true,
  },
  {
    label: 'User Management',
    path: '/admin/users',
    requireAuth: true,
    requireAdmin: true,
  },
];

export function NavigationBar() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [userMenuAnchor, setUserMenuAnchor] =
    React.useState<null | HTMLElement>(null);
  const { isDarkMode, toggleTheme } = useThemeContext();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const [logoutMutation] = useLogoutMutation();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      logout();
      handleUserMenuClose();
    }
  };

  // Filter nav items based on auth and admin status
  const filteredNavItems = navItems.filter((item) => {
    if (item.requireAuth && !isAuthenticated) return false;
    if (item.requireAdmin && !isAdmin) return false;
    return true;
  });

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
              <MenuIcon />
            </IconButton>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}>
              {filteredNavItems.map((item) => (
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

            {/* User section */}
            {isAuthenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                {isAdmin && (
                  <Chip
                    label='Admin'
                    color='secondary'
                    size='small'
                    sx={{ mr: 1, display: { xs: 'none', sm: 'inline-flex' } }}
                  />
                )}
                <IconButton
                  color='inherit'
                  onClick={handleUserMenuOpen}
                  aria-label='user menu'
                >
                  <Avatar sx={{ width: 32, height: 32 }}>
                    <Person />
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem disabled>
                    <Typography variant='body2'>
                      {user?.username} ({user?.role})
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ExitToApp sx={{ mr: 1 }} /> Logout
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Typography
                variant='body2'
                sx={{ ml: 2, display: { xs: 'none', sm: 'block' } }}
              >
                Please log in
              </Typography>
            )}

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

          {isAuthenticated && (
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                  <Person />
                </Avatar>
                <Typography variant='body1'>{user?.username}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={user?.role} color='primary' size='small' />
                {isAdmin && (
                  <Chip label='Admin' color='secondary' size='small' />
                )}
              </Box>
            </Box>
          )}

          <List sx={{ flexGrow: 1 }}>
            {filteredNavItems.map((item) => (
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

            {isAuthenticated && (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    handleLogout();
                    handleDrawerToggle();
                  }}
                  sx={{
                    py: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemText
                    primary='Logout'
                    primaryTypographyProps={{
                      fontSize: '1.1rem',
                      fontWeight: 500,
                    }}
                  />
                  <ExitToApp />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
