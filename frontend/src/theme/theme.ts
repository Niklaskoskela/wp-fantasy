import { createTheme } from '@mui/material/styles';
import { navMaxWidth, contentMaxWidth } from './constants';

// Water polo inspired color palette
const colors = {
  primary: {
    main: '#0066cc', // Water blue
    light: '#4d94ff',
    dark: '#004499',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#00b8d4', // Cyan
    light: '#4dd0e1',
    dark: '#0088a3',
    contrastText: '#000000',
  },
  success: {
    main: '#2e7d32', // Green for wins/positive stats
    light: '#4caf50',
    dark: '#1b5e20',
  },
  warning: {
    main: '#f57c00', // Orange for warnings
    light: '#ff9800',
    dark: '#e65100',
  },
  error: {
    main: '#d32f2f', // Red for errors/losses
    light: '#f44336',
    dark: '#c62828',
  },
  background: {
    default: '#f8f9fa',
    paper: '#ffffff',
  },
  text: {
    primary: '#1a1a1a',
    secondary: '#666666',
  },
};

// Create the theme
export const theme = createTheme({
  palette: {
    mode: 'light',
    ...colors,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
      marginBottom: '1rem',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      marginBottom: '0.875rem',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      marginBottom: '0.75rem',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      marginBottom: '0.75rem',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      marginBottom: '0.5rem',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      marginBottom: '0.5rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  spacing: 8, // Base spacing unit (8px)
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          },
          transition: 'box-shadow 0.3s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: 0,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: colors.primary.main,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '0 12px 12px 0',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&:hover': {
            backgroundColor: 'rgba(0, 102, 204, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 102, 204, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(0, 102, 204, 0.16)',
            },
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: `${contentMaxWidth}px !important`,
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

// Dark theme variant (optional)
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4d94ff',
      light: '#80b3ff',
      dark: '#0066cc',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4dd0e1',
      light: '#80deea',
      dark: '#00b8d4',
      contrastText: '#000000',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: theme.typography,
  spacing: theme.spacing,
  shape: theme.shape,
  components: {
    ...theme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          },
          transition: 'box-shadow 0.3s ease-in-out',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: `${contentMaxWidth}px !important`,
        },
      },
    },
  },
});
