import { useTheme } from '@mui/material/styles';
import { navMaxWidth, contentMaxWidth, spacing } from './constants';

export const useAppLayout = () => {
  const theme = useTheme();

  return {
    navMaxWidth,
    contentMaxWidth,
    spacing,

    // Common sx props for containers
    navContainerSx: {
      maxWidth: navMaxWidth,
      margin: '0 auto',
      width: '100%',
    },

    contentContainerSx: {
      maxWidth: contentMaxWidth,
      margin: '0 auto',
      width: '100%',
    },

    pageContainerSx: {
      maxWidth: contentMaxWidth,
      margin: '0 auto',
      width: '100%',
      padding: spacing.md,
      [theme.breakpoints.down('sm')]: {
        padding: spacing.sm,
      },
    },
  };
};
